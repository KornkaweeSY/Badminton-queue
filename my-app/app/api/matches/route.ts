import { NextResponse } from "next/server";
import { getCurrentStaffRole } from "@/lib/auth";
import { createMatch } from "@/lib/services/queue.service";
import { errorMessage } from "@/lib/errors";

// สร้างแมตช์ (จับคู่ลงคอร์ต) — admin เท่านั้น ตามที่ตกลงไว้
export async function POST(request: Request) {
  const role = await getCurrentStaffRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "เฉพาะแอดมินเท่านั้น" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const sessionId = typeof body?.session_id === "string" ? body.session_id : "";
  const courtId = typeof body?.court_id === "string" ? body.court_id : "";
  const teamA = Array.isArray(body?.team_a) ? body.team_a : [];
  const teamB = Array.isArray(body?.team_b) ? body.team_b : [];

  if (!sessionId || !courtId) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  try {
    const match = await createMatch({
      session_id: sessionId,
      court_id: courtId,
      teamA,
      teamB,
    });
    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "สร้างแมตช์ไม่สำเร็จ") },
      { status: 500 }
    );
  }
}
