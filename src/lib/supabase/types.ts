/**
 * Hand-written database types matching supabase/migrations/0001_init.sql.
 * Regenerate with `supabase gen types typescript` if the schema changes.
 */

export type ProfileRow = {
  id: string;
  role: "student" | "admin";
  name: string;
  email: string;
  branch: string;
  year: string;
  preferred_location: string;
  skills: string[];
  preferred_roles: string[];
  created_at: string;
  updated_at: string;
};

export type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  role: string;
  required_skills: string[];
  min_experience_years: number;
  summary: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationRow = {
  id: string;
  job_id: string;
  student_id: string;
  status: "applied" | "in review" | "rejected" | "accepted";
  applied_at: string;
};

export type ResumeRow = {
  id: string;
  student_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
};

export type ParsedResumeRow = {
  id: string;
  resume_id: string;
  student_id: string;
  name: string;
  degree: string;
  college: string;
  graduation_year: string;
  skills: string[];
  raw_text: string;
  created_at: string;
  updated_at: string;
};

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Partial<ProfileRow> & { id: string },
        Partial<ProfileRow>
      >;
      jobs: Table<
        JobRow,
        Omit<JobRow, "id" | "created_at" | "updated_at"> & { id?: string },
        Partial<JobRow>
      >;
      applications: Table<
        ApplicationRow,
        Omit<ApplicationRow, "id" | "applied_at" | "status"> & {
          id?: string;
          status?: ApplicationRow["status"];
          applied_at?: string;
        },
        Partial<ApplicationRow>
      >;
      resumes: Table<
        ResumeRow,
        Omit<ResumeRow, "id" | "uploaded_at"> & {
          id?: string;
          uploaded_at?: string;
        },
        Partial<ResumeRow>
      >;
      parsed_resumes: Table<
        ParsedResumeRow,
        Omit<ParsedResumeRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
        },
        Partial<ParsedResumeRow>
      >;
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<never, never>;
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
