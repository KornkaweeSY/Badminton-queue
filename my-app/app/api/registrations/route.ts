import { NextResponse } from "next/server";
import { registerForSession } from "@/lib/services/registration.service";
import { PLAYER_LEVELS } from "@/lib/constants/levels";
import { errorMessage } from "@/lib/errors";

const VALID_LEVELS = PLAYER_LEVELS.map((item) => item.value);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const sessionId = typeof body?.session_id === "string" ? body.session_id : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const lineName = typeof body?.line_name === "string" ? body.line_name.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const level = Number(body?.level);

  if (!sessionId) {
    return NextResponse.json({ error: "ไม่พบรอบเล่นที่จะลงทะเบียน" }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: "กรุณากรอกชื่อ" }, { status: 400 });
  }
  if (!lineName) {
    return NextResponse.json({ error: "กรุณากรอกชื่อไลน์" }, { status: 400 });
  }
  if (!VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
    return NextResponse.json({ error: "กรุณาเลือกระดับ" }, { status: 400 });
  }

  try {
    const registration = await registerForSession({
      session_id: sessionId,
      name,
      line_name: lineName,
      level,
      notes: notes || null,
    });
    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "บันทึกไม่สำเร็จ") },
      { status: 500 }
    );
  }
}
