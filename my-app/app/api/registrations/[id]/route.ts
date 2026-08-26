import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RegistrationsRepository } from "@/lib/repositories/registrations.repository";
import { errorMessage } from "@/lib/errors";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await new RegistrationsRepository(createAdminClient()).delete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: errorMessage(error, "ถอนตัวไม่สำเร็จ") },
      { status: 500 }
    );
  }
}
