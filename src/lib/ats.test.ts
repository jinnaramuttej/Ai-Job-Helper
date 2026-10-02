import { describe, it, expect } from "vitest";
import { scoreResume, checkJobMatch } from "./ats";

describe("ats", () => {
  describe("scoreResume", () => {
    it("scores a highly optimized resume well", () => {
      const text = `
        John Doe
        john@example.com | 123-456-7890 | github.com/johndoe
        
        Summary
        Experienced software engineer.
        
        Education
        B.Tech in Computer Science
        
        Skills
        JavaScript, React, Node.js, Python, SQL, Docker, AWS, Linux, Git, HTML, CSS, TypeScript, GraphQL, MongoDB, Redis, Agile
        
        Experience
        Developed scalable backend services. Built 3 microservices and improved performance by 20%.
        
        Projects
        Created a cool app.
      `;
      const result = scoreResume(text);
      expect(result.contactScore).toBe(15);
      expect(result.sectionScore).toBe(25);
      expect(result.actionScore).toBe(10);
      expect(result.keywordScore).toBe(40);
      expect(result.keywordsFound.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe("checkJobMatch", () => {
    it("returns missing skills and coverage", () => {
      const resumeText = "I know JavaScript, React, and Node.js.";
      const jobSkills = ["JavaScript", "React", "Python", "Docker"];
      const result = checkJobMatch(resumeText, jobSkills);
      
      expect(result.missingSkills).toEqual(["Python", "Docker"]);
      expect(result.keywordCoveragePercent).toBe(50); // 2 out of 4
    });
  });
});
