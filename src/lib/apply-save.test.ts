import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { applyToJob, saveJob, unsaveJob, getSavedJobs, getStudentApplications } from "./api-local";
import { MOCK_JOBS } from "./mock";

describe("Apply and Save flows", () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    // Mock localStorage
    global.window = {
      localStorage: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, val: string) => { store[key] = val; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        length: 0,
        key: () => null,
      } as Storage
    } as any;
  });

  afterEach(() => {
    // @ts-ignore
    delete global.window;
  });

  describe("Save / Unsave", () => {
    it("is idempotent for save and unsave", async () => {
      const jobId = MOCK_JOBS[0].id;
      
      // Save multiple times
      await saveJob(jobId);
      await saveJob(jobId);
      await saveJob(jobId);
      
      let saved = await getSavedJobs();
      expect(saved.length).toBe(1);
      expect(saved[0].id).toBe(jobId);

      // Unsave multiple times
      await unsaveJob(jobId);
      await unsaveJob(jobId);
      
      saved = await getSavedJobs();
      expect(saved.length).toBe(0);
    });
  });

  describe("Apply", () => {
    it("stores a snapshot of profile and match score, and rejects duplicates", async () => {
      const apps = await getStudentApplications("demo-user");
      const appliedJobIds = new Set(apps.map(a => a.job?.id));
      const jobId = MOCK_JOBS.find(j => !appliedJobIds.has(j.id))!.id;

      // First apply should succeed
      const application = await applyToJob(jobId);
      expect(application).not.toBeNull();
      expect(application?.snapshot).toBeDefined();
      expect(application?.snapshot?.profile).toBeDefined();
      expect(typeof application?.snapshot?.matchScore).toBe("number");

      // Verify it is saved in applications list
      const updatedApps = await getStudentApplications("demo-user");
      expect(updatedApps.some(a => a.application.id === application?.id)).toBe(true);

      // Second apply should throw an error
      await expect(applyToJob(jobId)).rejects.toThrow("You have already applied for this job.");
    });
  });
});
