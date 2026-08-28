import type { SupabaseClient } from "@supabase/supabase-js";
import type { Match, MatchResult, Team } from "@/lib/types/database";

export class MatchesRepository {
  constructor(private readonly db: SupabaseClient) {}

  // registration_id ของทุกคนที่กำลังเล่นอยู่ (แมตช์ status='playing') ใน session นี้
  async listPlayingRegistrationIds(sessionId: string): Promise<string[]> {
    const { data, error } = await this.db
      .from("matches")
      .select("match_players(registration_id)")
      .eq("session_id", sessionId)
      .eq("status", "playing");
    if (error) throw error;
    return (data ?? []).flatMap((m) =>
      (m.match_players as { registration_id: string }[]).map(
        (mp) => mp.registration_id
      )
    );
  }

  async listPlayingBySession(sessionId: string) {
    const { data, error } = await this.db
      .from("matches")
      .select(
        "*, courts(name), match_players(team, registrations(id, players(name, level)))"
      )
      .eq("session_id", sessionId)
      .eq("status", "playing")
      .order("started_at", { ascending: true });
    if (error) throw error;
    return data;
  }

  async create(input: {
    session_id: string;
    court_id: string;
    teamA: string[];
    teamB: string[];
  }): Promise<Match> {
    const { data: match, error } = await this.db
      .from("matches")
      .insert({ session_id: input.session_id, court_id: input.court_id })
      .select()
      .single();
    if (error) throw error;

    const matchPlayers = [
      ...input.teamA.map((registration_id) => ({
        match_id: match.id,
        registration_id,
        team: "A" as Team,
      })),
      ...input.teamB.map((registration_id) => ({
        match_id: match.id,
        registration_id,
        team: "B" as Team,
      })),
    ];

    const { error: mpError } = await this.db
      .from("match_players")
      .insert(matchPlayers);
    if (mpError) throw mpError;

    const { error: courtError } = await this.db
      .from("courts")
      .update({ status: "playing" })
      .eq("id", input.court_id);
    if (courtError) throw courtError;

    return match;
  }

  async finish(
    matchId: string,
    input: { result: MatchResult; score_a: number | null; score_b: number | null }
  ): Promise<Match> {
    const { data: match, error } = await this.db
      .from("matches")
      .update({
        status: "finished",
        finished_at: new Date().toISOString(),
        result: input.result,
        score_a: input.score_a,
        score_b: input.score_b,
      })
      .eq("id", matchId)
      .select()
      .single();
    if (error) throw error;

    const { error: courtError } = await this.db
      .from("courts")
      .update({ status: "idle" })
      .eq("id", match.court_id);
    if (courtError) throw courtError;

    return match;
  }

  async getMatchPlayerIds(
    matchId: string
  ): Promise<{ registration_id: string; team: Team; player_id: string }[]> {
    const { data, error } = await this.db
      .from("match_players")
      .select("registration_id, team, registrations(player_id)")
      .eq("match_id", matchId);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      registration_id: row.registration_id,
      team: row.team,
      player_id: (row.registrations as unknown as { player_id: string })
        .player_id,
    }));
  }
}
