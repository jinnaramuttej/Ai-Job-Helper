import { NextResponse } from "next/server";
import { createRequestClient, getBearerToken } from "@/lib/supabase/server";
import { parseResumeFile } from "@/lib/parse-resume";
import { RESUME_BUCKET } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function extensionOk(fileName: string): boolean {
  return /\.(pdf|doc|docx)$/i.test(fileName);
}

/**
 * Uploads a resume to Storage, extracts and parses its text server-side,
 * then upserts the resumes + parsed_resumes rows. Always returns a parse
 * result (blank fields when nothing matched) so the client form can show
 * something editable.
 */
export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const supabase = createRequestClient(token);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!ACCEPTED.has(file.type) && !extensionOk(file.name)) {
    return NextResponse.json(
      { error: "Only PDF or DOC files are allowed." },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Files must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
  const storagePath = `${user.id}/${Date.now()}-${safeName}`;

  const upload = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });
  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 400 });
  }

  const parsed = await parseResumeFile(buffer, file.type, file.name);

  // Replace any previous resume for this student (one resume per student).
  const { data: existing } = await supabase
    .from("resumes")
    .select("id, storage_path")
    .eq("student_id", user.id)
    .maybeSingle();

  if (existing && existing.storage_path !== storagePath) {
    await supabase.storage.from(RESUME_BUCKET).remove([existing.storage_path]);
  }

  const { data: resumeRow, error: resumeError } = await supabase
    .from("resumes")
    .upsert(
      {
        ...(existing ? { id: existing.id } : {}),
        student_id: user.id,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type || "",
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      },
      { onConflict: "student_id" },
    )
    .select()
    .single();

  if (resumeError || !resumeRow) {
    return NextResponse.json(
      { error: resumeError?.message ?? "Could not save the resume." },
      { status: 400 },
    );
  }

  const { error: parsedError } = await supabase.from("parsed_resumes").upsert(
    {
      resume_id: resumeRow.id,
      student_id: user.id,
      name: parsed.name,
      degree: parsed.degree,
      college: parsed.college,
      graduation_year: parsed.graduationYear,
      skills: parsed.skills,
      raw_text: parsed.text,
    },
    { onConflict: "resume_id" },
  );

  if (parsedError) {
    return NextResponse.json({ error: parsedError.message }, { status: 400 });
  }

  return NextResponse.json({
    file: {
      fileName: resumeRow.file_name,
      uploadedAt: resumeRow.uploaded_at,
    },
    parsed: {
      name: parsed.name,
      degree: parsed.degree,
      college: parsed.college,
      graduationYear: parsed.graduationYear,
      skills: parsed.skills,
    },
    text: parsed.text,
  });
}
