import { NextResponse } from "next/server";
import { getCurrentStaffRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CourtsRepository } from "@/lib/repositories/courts.repository";
import { errorMessage } from "@/lib/errors";

// ลบคอร์ต — admin เท่านั้น, ลบไม่ได้ถ้ากำลังมีแมตช์เล่นอยู่
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = await getCurrentStaffRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "เฉพาะแอดมินเท่านั้น" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const repo = new CourtsRepository(createAdminClient());
    const court = await repo.findById(id);
    if (court?.status === "playing") {
      return NextResponse.json(
        { error: "คอร์ตนี้กำลังมีแมตช์เล่นอยู่ ลบไม่ได้" },
        { status: 400 }
      );
    }

    await repo.delete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "ลบคอร์ตไม่สำเร็จ") },
      { status: 500 }
    );
  }
}
