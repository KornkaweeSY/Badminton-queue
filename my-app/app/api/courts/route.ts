import { NextResponse } from "next/server";
import { getCurrentStaffRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CourtsRepository } from "@/lib/repositories/courts.repository";
import { errorMessage } from "@/lib/errors";

// เพิ่มคอร์ต — admin เท่านั้น
export async function POST(request: Request) {
  const role = await getCurrentStaffRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "เฉพาะแอดมินเท่านั้น" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "กรุณากรอกชื่อคอร์ต" }, { status: 400 });
  }

  try {
    const court = await new CourtsRepository(createAdminClient()).create(name);
    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "เพิ่มคอร์ตไม่สำเร็จ") },
      { status: 500 }
    );
  }
}
