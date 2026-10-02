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
      - Name: ${profile.name}
      - Branch: ${profile.branch}
      - Year: ${profile.year}
      - Preferred Location: ${profile.preferredLocation}
      - Skills: ${profile.skills.join(", ")}
      - Preferred Roles: ${profile.preferredRoles.join(", ")}

      Here is a list of available jobs:
      ${jobs.map(j => `ID: ${j.id} | Title: ${j.title} | Company: ${j.company} | Skills: ${j.requiredSkills.join(", ")} | Location: ${j.location}`).join("\n")}

      Based on the student's profile, recommend the top 3 best matching jobs from the list above.
      For each recommendation, provide:
      1. The Job Title and Company
      2. A personalized, encouraging paragraph explaining exactly why their specific skills and background make them a great fit for this role.
      
      Format the output as a friendly, professional response using Markdown. Use bullet points for the 3 recommendations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return { result: response.text };
  } catch (error: any) {
    console.error("AI Suggestion error:", error);
    return { error: "Failed to generate AI suggestions. Please try again later." };
  }
}
