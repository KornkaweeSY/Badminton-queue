import type { SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "@/lib/types/database";

export class SessionsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByDate(playDate: string): Promise<Session | null> {
    const { data, error } = await this.db
      .from("sessions")
      .select("*")
      .eq("play_date", playDate)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  // รอบเล่นที่ใกล้ที่สุดที่ยังไม่ผ่านไป (ใช้ตอนเปิดหน้าลงชื่อ)
  async findNextOpen(fromDate: string): Promise<Session | null> {
    const { data, error } = await this.db
      .from("sessions")
      .select("*")
      .gte("play_date", fromDate)
      .order("play_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  }
}
