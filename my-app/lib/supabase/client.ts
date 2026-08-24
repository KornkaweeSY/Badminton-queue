import { createBrowserClient } from "@supabase/ssr";

// ใช้ใน Client Component (ไฟล์ที่มี "use client") เช่นตอน subscribe realtime
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
