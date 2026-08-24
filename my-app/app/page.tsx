import { createClient } from "@/lib/supabase/server";
import { CourtsRepository } from "@/lib/repositories/courts.repository";
import { PlayersRepository } from "@/lib/repositories/players.repository";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Court, Player } from "@/lib/types/database";

async function loadBoardData(): Promise<{
  courts: Court[];
  players: Player[];
  dbError: string | null;
}> {
  try {
    const db = await createClient();
    const [courts, players] = await Promise.all([
      new CourtsRepository(db).listAll(),
      new PlayersRepository(db).listAll(),
    ]);
    return { courts, players, dbError: null };
  } catch (error) {
    return {
      courts: [],
      players: [],
      dbError: error instanceof Error ? error.message : "เชื่อมต่อฐานข้อมูลไม่สำเร็จ",
    };
  }
}

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export default async function Home() {
  const { courts, players, dbError } = await loadBoardData();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground text-sm font-bold">
              B
            </span>
            <h1 className="text-lg font-semibold tracking-tight">
              คิวตีแบดมินตัน
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10">
        {dbError && (
          <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
            ยังต่อฐานข้อมูลไม่ได้: {dbError}
          </div>
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
              ผู้เล่นทั้งหมด
            </h2>
            <span className="text-sm text-muted">{players.length} คน</span>
          </div>

          {players.length === 0 ? (
            <EmptyState label="ยังไม่มีผู้เล่นในระบบ" />
          ) : (
            <ul className="flex flex-col gap-2">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm transition-colors hover:bg-surface-hover"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                      {initials(player.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{player.name}</p>
                      {player.line_name && (
                        <p className="truncate text-sm text-muted">
                          LINE: {player.line_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-sm">
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 font-medium text-accent">
                      W {player.wins}
                    </span>
                    <span className="rounded-full bg-muted/15 px-2.5 py-1 font-medium text-muted">
                      L {player.losses}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
      {label}
    </div>
  );
}
