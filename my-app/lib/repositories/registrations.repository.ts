import type { SupabaseClient } from "@supabase/supabase-js";
import type { RegistrationWithPlayer } from "@/lib/types/database";

export class RegistrationsRepository {
  constructor(private readonly db: SupabaseClient) {}

  // เรียงตามเวลาสมัคร (created_at) เพื่อให้หน้าเรียกไปตัด confirmed/waitlist ตาม capacity ได้ตรง
  async listBySession(sessionId: string): Promise<RegistrationWithPlayer[]> {
    const { data, error } = await this.db
      .from("registrations")
      .select("*, players(name, line_name, level)")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as RegistrationWithPlayer[];
  }

  async create(input: {
    session_id: string;
    player_id: string;
    notes: string | null;
  }) {
    const { data, error } = await this.db
      .from("registrations")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from("registrations").delete().eq("id", id);
    if (error) throw error;
  }

  async checkIn(id: string): Promise<void> {
    const { error } = await this.db
      .from("registrations")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  }
}
