import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// ใช้ใน Server Component / Route Handler สำหรับ "อ่าน" ข้อมูล (สิทธิ์เท่ากับ anon key + RLS)
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // เรียกจาก Server Component ล้วนๆ (ไม่มี response ให้ set cookie) ข้ามได้
            // เพราะยังไม่มีระบบ auth ที่ต้อง refresh session ในตอนนี้
          }
        },
      },
    }
  );
}
