"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getStudents, type Student } from "@/lib/api";
import { displayName, normalize } from "@/lib/skills";
import { inputClasses, labelClasses } from "@/components/form";
import { TableShell, tdClasses, thClasses, trClasses } from "@/components/table";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    getStudents().then((loaded) => {
      if (!cancelled) setStudents(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!students) return [];
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) =>
      [student.name, student.email, student.branch, student.year].some(
        (value) => value.toLowerCase().includes(q),
      ),
    );
  }, [students, query]);

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
      <p className="mt-2 text-[15px] text-muted">
        Search students and open a student to see their profile and
        applications.
      </p>

      <div className="mt-5 max-w-sm">
        <label htmlFor="student-search" className={labelClasses}>
          Search students
        </label>
        <input
          id="student-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, email, branch, or year"
          className={inputClasses}
        />
      </div>

      <div className="mt-4">
        {students === null ? (
          <p className="text-[15px] text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-[15px] text-muted">
            No students match “{query.trim()}”.
          </p>
        ) : (
          <TableShell>
            <thead>
              <tr>
                <th scope="col" className={thClasses}>
                  Name
                </th>
                <th scope="col" className={thClasses}>
                  Email
                </th>
                <th scope="col" className={thClasses}>
                  Branch
                </th>
                <th scope="col" className={thClasses}>
                  Year
                </th>
                <th scope="col" className={thClasses}>
                  Skills
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} className={trClasses}>
                  <td className={`${tdClasses} whitespace-nowrap`}>
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="font-medium text-accent underline-offset-2 transition-colors duration-150 hover:underline"
                    >
                      {student.name}
                    </Link>
                  </td>
                  <td className={tdClasses}>{student.email}</td>
                  <td className={tdClasses}>{student.branch}</td>
                  <td className={`${tdClasses} whitespace-nowrap`}>
                    {student.year}
                  </td>
                  <td className={tdClasses}>
                    {normalize(student.skills).map(displayName).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </div>
    </section>
  );
}
