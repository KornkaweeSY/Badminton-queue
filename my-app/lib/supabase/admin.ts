import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// สิทธิ์ระดับ secret key (ข้าม RLS ได้ทั้งหมด) — ใช้เฉพาะใน Route Handler / server code
// ห้าม import ไฟล์นี้จาก Client Component เด็ดขาด เพราะ SUPABASE_SECRET_KEY ต้องไม่หลุดไปฝั่ง browser
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}
