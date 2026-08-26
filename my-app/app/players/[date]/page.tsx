import { createClient } from "@/lib/supabase/server";
import { SessionsRepository } from "@/lib/repositories/sessions.repository";
import { RegistrationsRepository } from "@/lib/repositories/registrations.repository";
import { RegistrationTable } from "@/components/registration-table";
import { formatThaiDate } from "@/lib/format";
import { errorMessage } from "@/lib/errors";
import type { RegistrationWithPlayer, Session } from "@/lib/types/database";

async function loadRosterData(date: string): Promise<{
  session: Session | null;
  registrations: RegistrationWithPlayer[];
  dbError: string | null;
}> {
  try {
    const db = await createClient();
    const session = await new SessionsRepository(db).findByDate(date);
    if (!session) return { session: null, registrations: [], dbError: null };

    const registrations = await new RegistrationsRepository(db).listBySession(
      session.id
    );
    return { session, registrations, dbError: null };
  } catch (error) {
    return {
      session: null,
      registrations: [],
      dbError: errorMessage(error, "เชื่อมต่อฐานข้อมูลไม่สำเร็จ"),
    };
  }
}

export default async function PlayersByDatePage({
  params,
}: PageProps<"/players/[date]">) {
  const { date } = await params;
  const { session, registrations, dbError } = await loadRosterData(date);

  if (dbError) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold">{formatThaiDate(date)}</h1>
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
          ยังต่อฐานข้อมูลไม่ได้: {dbError}
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold">{formatThaiDate(date)}</h1>
        <p className="text-sm text-muted">ยังไม่เปิดรับสมัครวันนี้</p>
      </main>
    );
  }

  const confirmed = registrations.slice(0, session.capacity);
  const waitlist = registrations.slice(session.capacity);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">
          รายชื่อวันที่ {formatThaiDate(date)}
        </h1>
        <p className="text-sm text-muted">
          ยืนยันแล้ว {confirmed.length}/{session.capacity} คน
          {waitlist.length > 0 && ` · สำรอง ${waitlist.length} คน`}
        </p>
      </div>

      <RegistrationTable title="รายชื่อยืนยัน" rows={confirmed} />

      {waitlist.length > 0 && (
        <RegistrationTable title="รายชื่อสำรอง" rows={waitlist} waitlist />
      )}
    </main>
  );
}
