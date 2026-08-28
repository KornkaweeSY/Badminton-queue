"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { levelLabel } from "@/lib/constants/levels";
import type { Court, RegistrationWithPlayer } from "@/lib/types/database";
import type { PlayingMatch } from "@/lib/services/queue.service";

export function QueueBoard({
  sessionId,
  isAdmin,
  courts,
  waitingPool,
  playingMatches,
}: {
  sessionId: string;
  isAdmin: boolean;
  courts: Court[];
  waitingPool: RegistrationWithPlayer[];
  playingMatches: PlayingMatch[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [courtId, setCourtId] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newCourtName, setNewCourtName] = useState("");
  const [addingCourt, setAddingCourt] = useState(false);
  const [courtManageError, setCourtManageError] = useState<string | null>(null);
  const [deletingCourtId, setDeletingCourtId] = useState<string | null>(null);

  const idleCourts = courts.filter((c) => c.status === "idle");

  async function handleAddCourt() {
    setCourtManageError(null);
    if (!newCourtName.trim()) {
      setCourtManageError("กรอกชื่อคอร์ต");
      return;
    }
    setAddingCourt(true);
    try {
      const res = await fetch("/api/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCourtName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เพิ่มคอร์ตไม่สำเร็จ");
      setNewCourtName("");
      router.refresh();
    } catch (error) {
      setCourtManageError(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด"
      );
    } finally {
      setAddingCourt(false);
    }
  }

  async function handleDeleteCourt(id: string) {
    setCourtManageError(null);
    setDeletingCourtId(id);
    try {
      const res = await fetch(`/api/courts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ลบคอร์ตไม่สำเร็จ");
      router.refresh();
    } catch (error) {
      setCourtManageError(
        error instanceof Error ? error.message : "เกิดข้อผิดพลาด"
      );
    } finally {
      setDeletingCourtId(null);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  async function handleCreateMatch() {
    setCreateError(null);
    if (selected.length !== 4) {
      setCreateError("เลือกให้ครบ 4 คน");
      return;
    }
    if (!courtId) {
      setCreateError("เลือกคอร์ต");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          court_id: courtId,
          team_a: selected.slice(0, 2),
          team_b: selected.slice(2, 4),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "สร้างแมตช์ไม่สำเร็จ");

      setSelected([]);
      setCourtId("");
      router.refresh();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {isAdmin && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            จัดการคอร์ต ({courts.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {courts.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-3 pr-1.5 text-sm"
              >
                {c.name}
                <button
                  type="button"
                  onClick={() => handleDeleteCourt(c.id)}
                  disabled={c.status === "playing" || deletingCourtId === c.id}
                  title={
                    c.status === "playing"
                      ? "กำลังมีแมตช์เล่นอยู่ ลบไม่ได้"
                      : "ลบคอร์ตนี้"
                  }
                  className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:bg-warning/15 hover:text-warning disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              placeholder="ชื่อคอร์ตใหม่ เช่น คอร์ต 4"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={handleAddCourt}
              disabled={addingCourt}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              {addingCourt ? "กำลังเพิ่ม..." : "+ เพิ่มคอร์ต"}
            </button>
          </div>
          {courtManageError && (
            <p className="text-sm text-warning">{courtManageError}</p>
          )}
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          กำลังเล่นอยู่ ({playingMatches.length})
        </h2>
        {playingMatches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            ยังไม่มีแมตช์ที่กำลังเล่น
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
          รอลงคอร์ต ({waitingPool.length})
        </h2>
        {waitingPool.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            ยังไม่มีใครเช็คอินรอ
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {waitingPool.map((r) => {
              const order = selected.indexOf(r.id);
              const isSelected = order !== -1;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    disabled={!isAdmin || (!isSelected && selected.length >= 4)}
                    onClick={() => toggleSelect(r.id)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:opacity-40 ${
                      isSelected
                        ? "border-accent bg-accent/10"
                        : "border-border bg-surface hover:bg-surface-hover"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {isAdmin && (
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            isSelected
                              ? "bg-accent text-accent-foreground"
                              : "border border-border text-muted"
                          }`}
                        >
                          {isSelected ? (order < 2 ? "A" : "B") : ""}
                        </span>
                      )}
                      <span className="font-medium">{r.players.name}</span>
                    </span>
                    <span className="rounded-full bg-muted/15 px-2 py-0.5 text-xs text-muted">
                      {levelLabel(r.players.level)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {isAdmin && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">
              เลือกแล้ว {selected.length}/4 คน — 2 คนแรก = ทีม A, 2 คนหลัง = ทีม B
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="">เลือกคอร์ต</option>
                {idleCourts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleCreateMatch}
                disabled={creating}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {creating ? "กำลังสร้าง..." : "สร้างแมตช์"}
              </button>
            </div>
            {createError && <p className="text-sm text-warning">{createError}</p>}
          </div>
        )}
      </section>
    </div>
  );
}

function MatchCard({ match }: { match: PlayingMatch }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<"team_a" | "team_b" | "draw" | "">("");
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamA = match.players.filter((p) => p.team === "A");
  const teamB = match.players.filter((p) => p.team === "B");

  async function handleFinish() {
    setError(null);
    if (!result) {
      setError("เลือกผลการแข่งขัน");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/matches/${match.id}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, score_a: scoreA, score_b: scoreB }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกผลไม่สำเร็จ");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="text-xs text-muted">ทีม A</span>
          {teamA.map((p) => (
            <p key={p.registrationId} className="truncate font-medium">
              {p.name}
            </p>
          ))}
        </div>
        <span className="px-1 text-xs font-semibold text-muted">VS</span>
        <div className="flex flex-col gap-0.5 text-right text-sm">
          <span className="text-xs text-muted">ทีม B</span>
          {teamB.map((p) => (
            <p key={p.registrationId} className="truncate font-medium">
              {p.name}
            </p>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-xs text-muted">{match.courtName}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          กำลังเล่น
        </span>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-hover"
        >
          จบแมตช์
        </button>
      ) : (
        <div className="flex flex-col gap-3 border-t border-border pt-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["team_a", "ทีม A ชนะ"],
                ["team_b", "ทีม B ชนะ"],
                ["draw", "เสมอ"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setResult(value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  result === value
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-surface hover:bg-surface-hover"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              placeholder="คะแนน A (ไม่บังคับ)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
            />
            <span className="text-muted">–</span>
            <input
              type="number"
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              placeholder="คะแนน B (ไม่บังคับ)"
              className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
            />
          </div>
          {error && <p className="text-sm text-warning">{error}</p>}
          <button
            type="button"
            onClick={handleFinish}
            disabled={submitting}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "กำลังบันทึก..." : "ยืนยันผล"}
          </button>
        </div>
      )}
    </div>
  );
}
