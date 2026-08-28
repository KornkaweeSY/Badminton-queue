import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionsRepository } from "@/lib/repositories/sessions.repository";
import { getCurrentStaffRole } from "@/lib/auth";
import { todayIso } from "@/lib/format";

export default async function QueueIndexPage() {
  const role = await getCurrentStaffRole();
  if (!role) redirect("/login");

  const db = await createClient();
  const session = await new SessionsRepository(db).findNextOpen(todayIso());

  if (session) redirect(`/queue/${session.play_date}`);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-12">
      <h1 className="text-2xl font-semibold">จัดการคิว</h1>
      <p className="text-sm text-muted">ยังไม่มีรอบเล่นที่เปิดอยู่</p>
    </main>
  );
}
