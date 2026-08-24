export type Player = {
  id: string;
  name: string;
  line_name: string | null;
  position: string | null;
  wins: number;
  losses: number;
  created_at: string;
};

export type CourtStatus = "idle" | "playing";

export type Court = {
  id: string;
  name: string;
  status: CourtStatus;
};

export type MatchStatus = "playing" | "finished";

export type Match = {
  id: string;
  court_id: string;
  status: MatchStatus;
  started_at: string;
  finished_at: string | null;
};

export type Team = "A" | "B";

export type MatchPlayer = {
  match_id: string;
  player_id: string;
  team: Team;
};

export type QueueEntry = {
  id: string;
  player_id: string;
  order_index: number;
  joined_at: string;
};
