"use server";

import { GoogleGenAI } from '@google/genai';
import { getProfile, getJobs } from '@/lib/api';

export async function getAiJobSuggestions() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { error: "GEMINI_API_KEY is not configured in the environment." };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const profile = await getProfile();
    const jobs = await getJobs();

    if (!profile.skills || profile.skills.length === 0) {
      return { error: "Your profile doesn't have any skills yet. Please add some skills or upload your resume first." };
    }

    if (jobs.length === 0) {
      return { error: "There are currently no jobs available to suggest." };
    }

    const prompt = `
      You are an expert career advisor.
      Here is the profile of a student seeking a job:
      - Branch: ${profile.branch}
      - Year: ${profile.year}
      - Preferred Location: ${profile.preferredLocation}
      - Skills: ${profile.skills.join(", ")}
      - Preferred Roles: ${profile.preferredRoles.join(", ")}

      Here is a list of available jobs:
      ${jobs.map(j => `ID: ${j.id} | Title: ${j.title} | Company: ${j.company} | Skills: ${j.requiredSkills.join(", ")} | Location: ${j.location}`).join("\n")}

      Based on the student's profile, recommend the top 3 best matching jobs from the list above.
      For each recommendation, provide:
      1. The Job Title linked to its apply page. You MUST use this exact markdown format: [Job Title - Company](/jobs/JOB_ID) (Replace JOB_ID with the actual ID from the list).
      2. A personalized, encouraging paragraph explaining exactly why their specific skills and background make them a great fit for this role.
      
      Format the output as a friendly, professional response using Markdown. Use bullet points for the 3 recommendations. 
      IMPORTANT: DO NOT include any greetings like "Hello Demo User" or "Hi there". Get straight to the recommendations.
    `;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
    } catch (e: any) {
      if (e.status === 503 || e?.error?.status === 'UNAVAILABLE') {
        console.warn("gemini-3.8-flash is experiencing high demand, falling back to gemini-1.5-flash...");
        response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });
      } else {
        throw e;
      }
    }

    return { result: response.text };
  } catch (error: any) {
    console.error("AI Suggestion error:", error);
    return { error: "Failed to generate AI suggestions. The AI service might be experiencing high demand. Please try again later." };
  }
}
