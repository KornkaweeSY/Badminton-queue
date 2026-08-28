import { NextResponse } from "next/server";
import { getCurrentStaffRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { RegistrationsRepository } from "@/lib/repositories/registrations.repository";
import { errorMessage } from "@/lib/errors";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = await getCurrentStaffRole();
  if (!role) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await new RegistrationsRepository(createAdminClient()).checkIn(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "เช็คอินไม่สำเร็จ") },
      { status: 500 }
    );
  }
}
