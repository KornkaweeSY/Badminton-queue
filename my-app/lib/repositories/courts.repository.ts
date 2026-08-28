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

  async create(name: string): Promise<Court> {
    const { data, error } = await this.db
      .from("courts")
      .insert({ name })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<Court | null> {
    const { data, error } = await this.db
      .from("courts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db.from("courts").delete().eq("id", id);
    if (error) throw error;
  }
}
