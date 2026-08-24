import type { SupabaseClient } from "@supabase/supabase-js";
import type { Player } from "@/lib/types/database";

export class PlayersRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listAll(): Promise<Player[]> {
    const { data, error } = await this.db
      .from("players")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  }

  async create(input: {
    name: string;
    line_name?: string | null;
    position?: string | null;
  }): Promise<Player> {
    const { data, error } = await this.db
      .from("players")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
