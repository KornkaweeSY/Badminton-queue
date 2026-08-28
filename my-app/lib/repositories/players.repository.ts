import type { SupabaseClient } from "@supabase/supabase-js";
import type { Player } from "@/lib/types/database";

export class PlayersRepository {
  constructor(private readonly db: SupabaseClient) {}

  // (name, line_name) เป็น natural key ที่ใช้บอกว่า "คนเดิมมาลงชื่ออีกรอบ" หรือ "คนใหม่"
  async findByNameAndLine(
    name: string,
    lineName: string
  ): Promise<Player | null> {
    const { data, error } = await this.db
      .from("players")
      .select("*")
      .eq("name", name)
      .eq("line_name", lineName)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(input: {
    name: string;
    line_name: string;
    level: number;
  }): Promise<Player> {
    const { data, error } = await this.db
      .from("players")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // อัปเดต level ตามที่ผู้เล่นกรอกล่าสุด (self-reported อาจเปลี่ยนได้เมื่อฝีมือขยับ)
  async updateLevel(id: string, level: number): Promise<void> {
    const { error } = await this.db.from("players").update({ level }).eq("id", id);
    if (error) throw error;
  }

  // +1 ให้ field สถิติที่ระบุ (ใช้ตอนบันทึกผลแมตช์) — สเกลแอปนี้เล็ก ไม่ต้องกังวลเรื่อง race condition
  async incrementStat(
    id: string,
    field: "wins" | "losses" | "draws"
  ): Promise<void> {
    const { data: player, error: fetchError } = await this.db
      .from("players")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const current = (player as Player)[field];
    const { error } = await this.db
      .from("players")
      .update({ [field]: current + 1 })
      .eq("id", id);
    if (error) throw error;
  }
}
