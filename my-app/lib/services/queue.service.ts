import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { RegistrationsRepository } from "@/lib/repositories/registrations.repository";
import { MatchesRepository } from "@/lib/repositories/matches.repository";
import { PlayersRepository } from "@/lib/repositories/players.repository";
import type { MatchResult, RegistrationWithPlayer } from "@/lib/types/database";

export type PlayingMatch = {
  id: string;
  courtName: string;
  players: {
    registrationId: string;
    team: "A" | "B";
    name: string;
    level: number | null;
  }[];
};

type PlayingMatchRow = {
  id: string;
  courts: { name: string } | null;
  match_players: {
    team: "A" | "B";
    registrations: {
      id: string;
      players: { name: string; level: number | null } | null;
    } | null;
  }[];
};

export async function getPlayingMatches(
  sessionId: string
): Promise<PlayingMatch[]> {
  const db = createAdminClient();
  const rows = (await new MatchesRepository(db).listPlayingBySession(
    sessionId
  )) as unknown as PlayingMatchRow[];

  return rows.map((row) => ({
    id: row.id,
    courtName: row.courts?.name ?? "-",
    players: row.match_players.map((mp) => ({
      registrationId: mp.registrations?.id ?? "",
      team: mp.team,
      name: mp.registrations?.players?.name ?? "-",
      level: mp.registrations?.players?.level ?? null,
    })),
  }));
}

// รอลงคอร์ต = เช็คอินแล้ว แต่ไม่ได้อยู่ในแมตช์ที่กำลังเล่นอยู่ (คำนวณสด ไม่เก็บ state แยก)
export async function getWaitingPool(
  sessionId: string
): Promise<RegistrationWithPlayer[]> {
  const db = createAdminClient();
  const registrationsRepo = new RegistrationsRepository(db);
  const matchesRepo = new MatchesRepository(db);

  const [all, playingIds] = await Promise.all([
    registrationsRepo.listBySession(sessionId),
    matchesRepo.listPlayingRegistrationIds(sessionId),
  ]);

  const playingSet = new Set(playingIds);
  return all.filter(
    (r) => r.checked_in_at !== null && !playingSet.has(r.id)
  );
}

export async function createMatch(input: {
  session_id: string;
  court_id: string;
  teamA: string[];
  teamB: string[];
}) {
  if (input.teamA.length !== 2 || input.teamB.length !== 2) {
    throw new Error("ต้องเลือกทีมละ 2 คน (รวม 4 คน)");
  }

  const db = createAdminClient();
  return new MatchesRepository(db).create(input);
}

export async function finishMatch(
  matchId: string,
  input: { result: MatchResult; score_a: number | null; score_b: number | null }
) {
  const db = createAdminClient();
  const matchesRepo = new MatchesRepository(db);
  const playersRepo = new PlayersRepository(db);

  const players = await matchesRepo.getMatchPlayerIds(matchId);
  const match = await matchesRepo.finish(matchId, input);

  await Promise.all(
    players.map((p) => {
      const field =
        input.result === "draw"
          ? "draws"
          : (input.result === "team_a") === (p.team === "A")
            ? "wins"
            : "losses";
      return playersRepo.incrementStat(p.player_id, field);
    })
  );

  return match;
}
