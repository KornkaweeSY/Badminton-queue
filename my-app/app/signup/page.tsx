import { createClient } from "@/lib/supabase/server";
import { SessionsRepository } from "@/lib/repositories/sessions.repository";
import { SignupForm } from "@/components/signup-form";
import { formatThaiDate, todayIso } from "@/lib/format";

export default async function SignupPage() {
  const db = await createClient();
  const session = await new SessionsRepository(db).findNextOpen(todayIso());

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">ลงชื่อเข้าคิว</h1>
        <p className="text-sm text-muted">
          {session
            ? `รอบเล่นวันที่ ${formatThaiDate(session.play_date)} — เปิดรับ ${session.capacity} คน`
            : "กรอกข้อมูลเพื่อเข้าคิวตีแบดมินตัน"}
        </p>
      </div>

      {session ? (
        <SignupForm sessionId={session.id} sessionDate={session.play_date} />
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          ยังไม่เปิดรับสมัครตอนนี้ รอแอดมินเปิดรอบเล่นก่อนนะ
        </p>
      )}
    </main>
  );
}
