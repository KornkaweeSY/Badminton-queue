"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { PLAYER_LEVELS } from "@/lib/constants/levels";

export function SignupForm({
  sessionId,
  sessionDate,
}: {
  sessionId: string;
  sessionDate: string;
}) {
  const [name, setName] = useState("");
  const [lineName, setLineName] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("กรุณากรอกชื่อ");
    if (!lineName.trim()) return setError("กรุณากรอกชื่อไลน์");
    if (!level) return setError("กรุณาเลือกระดับ");

    setSubmitting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          name,
          line_name: lineName,
          level,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");

      setSuccess(true);
      setName("");
      setLineName("");
      setLevel(null);
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-accent/30 bg-accent/10 px-6 py-10 text-center">
        <p className="text-lg font-medium text-accent">ลงชื่อเรียบร้อยแล้ว</p>
        <p className="text-sm text-muted">ขอบคุณที่ลงทะเบียนเข้าคิว</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
          >
            ลงชื่อคนต่อไป
          </button>
          <Link
            href={`/players/${sessionDate}`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            ดูรายชื่อ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Field label="ชื่อ" required>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="เช่น สมชาย"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
      </Field>

      <Field label="ระดับ" required>
        <div className="flex flex-wrap gap-2">
          {PLAYER_LEVELS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setLevel(item.value)}
              aria-pressed={level === item.value}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                level === item.value
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-surface text-foreground hover:bg-surface-hover"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="ชื่อไลน์" required>
        <input
          type="text"
          value={lineName}
          onChange={(e) => setLineName(e.target.value)}
          placeholder="ชื่อที่ใช้ใน LINE"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
      </Field>

      <Field label="หมายเหตุ">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="ไม่บังคับ"
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
      </Field>

      {error && <p className="text-sm text-warning">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "กำลังบันทึก..." : "ลงชื่อ"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-warning"> *</span>}
      </span>
      {children}
    </div>
  );
}
