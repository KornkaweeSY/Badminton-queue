"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { levelLabel } from "@/lib/constants/levels";
import type { RegistrationWithPlayer } from "@/lib/types/database";

export function RegistrationTable({
  title,
  rows,
  waitlist,
  canCheckIn,
}: {
  title: string;
  rows: RegistrationWithPlayer[];
  waitlist?: boolean;
  canCheckIn?: boolean;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  async function handleWithdraw(id: string, name: string) {
    if (!confirm(`ให้ "${name}" ถอนตัวใช่ไหม?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "ถอนตัวไม่สำเร็จ");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCheckIn(id: string) {
    setCheckingInId(id);
    try {
      const res = await fetch(`/api/registrations/${id}/check-in`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "เช็คอินไม่สำเร็จ");
      }
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setCheckingInId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
        {title} ({rows.length})
      </h2>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          ยังไม่มีรายชื่อ
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-muted">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">ชื่อ</th>
                <th className="px-4 py-3 font-medium">ระดับ</th>
                <th className="px-4 py-3 font-medium">ชื่อไลน์</th>
                <th className="px-4 py-3 font-medium">หมายเหตุ</th>
                {canCheckIn && <th className="px-4 py-3 font-medium">เช็คอิน</th>}
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b border-border bg-surface transition-colors last:border-0 hover:bg-surface-hover"
                >
                  <td className="px-4 py-3 text-muted">
                    {waitlist ? `สำรอง ${i + 1}` : i + 1}
                  </td>
                  <td className="px-4 py-3 font-medium">{row.players.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted/15 px-2 py-0.5 text-xs text-muted">
                      {levelLabel(row.players.level)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{row.players.line_name}</td>
                  <td className="px-4 py-3 text-muted">{row.notes || "-"}</td>
                  {canCheckIn && (
                    <td className="px-4 py-3">
                      {row.checked_in_at ? (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                          เช็คอินแล้ว
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCheckIn(row.id)}
                          disabled={checkingInId === row.id}
                          className="rounded-lg border border-accent/40 px-3 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
                        >
                          {checkingInId === row.id ? "..." : "เช็คอิน"}
                        </button>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleWithdraw(row.id, row.players.name)}
                      disabled={deletingId === row.id}
                      className="rounded-lg border border-warning/40 px-3 py-1 text-xs font-medium text-warning transition-colors hover:bg-warning/10 disabled:opacity-50"
                    >
                      {deletingId === row.id ? "กำลังลบ..." : "ถอนตัว"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
