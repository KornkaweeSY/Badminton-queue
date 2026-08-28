import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StaffRole } from "@/lib/types/database";

// null = ไม่ได้ login หรือ login แล้วแต่ไม่มีสิทธิ์ staff/admin
export async function getCurrentStaffRole(): Promise<StaffRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("staff_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return (data?.role as StaffRole | undefined) ?? null;
}
