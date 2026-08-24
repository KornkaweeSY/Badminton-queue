import type { SupabaseClient } from "@supabase/supabase-js";
import type { Court } from "@/lib/types/database";

export class CourtsRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listAll(): Promise<Court[]> {
    const { data, error } = await this.db
      .from("courts")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  }
}
