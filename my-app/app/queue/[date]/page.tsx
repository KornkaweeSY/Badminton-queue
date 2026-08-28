import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionsRepository } from "@/lib/repositories/sessions.repository";
import { CourtsRepository } from "@/lib/repositories/courts.repository";
import { getWaitingPool, getPlayingMatches } from "@/lib/services/queue.service";
import { getCurrentStaffRole } from "@/lib/auth";
import { QueueBoard } from "@/components/queue-board";
import { formatThaiDate } from "@/lib/format";
import { errorMessage } from "@/lib/errors";

export default async function QueueByDatePage({
  params,
}: PageProps<"/queue/[date]">) {
  const { date } = await params;

  const role = await getCurrentStaffRole();
  if (!role) redirect("/login");

  try {
    const db = await createClient();
    const session = await new SessionsRepository(db).findByDate(date);

    if (!session) {
      return (
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-12">
          <h1 className="text-2xl font-semibold">{formatThaiDate(date)}</h1>
          <p className="text-sm text-muted">ยังไม่เปิดรับสมัครวันนี้</p>
        </main>
      );
    }

    const [courts, waitingPool, playingMatches] = await Promise.all([
      new CourtsRepository(db).listAll(),
      getWaitingPool(session.id),
      getPlayingMatches(session.id),
    ]);

    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            จัดการคิว — {formatThaiDate(date)}
          </h1>
          <p className="text-sm text-muted">
            สิทธิ์: {role === "admin" ? "แอดมิน" : "staff"}
          </p>
        </div>

        <QueueBoard
          sessionId={session.id}
          isAdmin={role === "admin"}
          courts={courts}
          waitingPool={waitingPool}
          playingMatches={playingMatches}
        />
      </main>
    );
  } catch (error) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold">{formatThaiDate(date)}</h1>
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          ยังต่อฐานข้อมูลไม่ได้: {errorMessage(error, "เชื่อมต่อฐานข้อมูลไม่สำเร็จ")}
        </div>
      </main>
    );
  }
}
