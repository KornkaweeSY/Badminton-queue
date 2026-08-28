import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CourtsRepository } from "@/lib/repositories/courts.repository";
import { SessionsRepository } from "@/lib/repositories/sessions.repository";
import { errorMessage } from "@/lib/errors";
import { formatThaiDate, todayIso } from "@/lib/format";
import type { Court, Session } from "@/lib/types/database";

async function loadBoardData(): Promise<{
  courts: Court[];
  session: Session | null;
  dbError: string | null;
}> {
  try {
    const db = await createClient();
    const [courts, session] = await Promise.all([
      new CourtsRepository(db).listAll(),
      new SessionsRepository(db).findNextOpen(todayIso()),
    ]);
    return { courts, session, dbError: null };
  } catch (error) {
    return {
      courts: [],
      session: null,
      dbError: errorMessage(error, "เชื่อมต่อฐานข้อมูลไม่สำเร็จ"),
    };
  }
}

export default async function Home() {
  const { courts, session, dbError } = await loadBoardData();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
      {dbError && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          ยังต่อฐานข้อมูลไม่ได้: {dbError}
        </div>
      )}

      {session && (
        <Link
          href={`/players/${session.play_date}`}
          className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm transition-colors hover:bg-accent/15"
        >
          <span>ดูรายชื่อรอบเล่นวันที่ {formatThaiDate(session.play_date)}</span>
          <span className="font-medium text-accent">ดูรายชื่อ →</span>
        </Link>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            สนาม
          </h2>
          <span className="text-sm text-muted">{courts.length} คอร์ต</span>
        </div>

        {courts.length === 0 ? (
          <EmptyState label="ยังไม่มีข้อมูลสนาม" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {courts.map((court) => {
              const playing = court.status === "playing";
              return (
                <div
                  key={court.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:bg-surface-hover"
                >
                  <p className="font-medium">{court.name}</p>
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      playing
                        ? "bg-accent/15 text-accent"
                        : "bg-muted/15 text-muted"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        playing ? "bg-accent animate-pulse" : "bg-muted"
                      }`}
                    />
                    {playing ? "กำลังตี" : "ว่าง"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
      {label}
    </div>
  );
}
