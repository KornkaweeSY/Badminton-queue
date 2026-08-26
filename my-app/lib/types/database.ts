export type Player = {
  id: string;
  name: string;
  line_name: string;
  level: number | null;
  wins: number;
  losses: number;
  created_at: string;
};

export type Session = {
  id: string;
  play_date: string; // YYYY-MM-DD
  capacity: number;
  created_at: string;
};

export type Registration = {
  id: string;
  session_id: string;
  player_id: string;
  notes: string | null;
  created_at: string;
};

// registrations.listBySession join กับ players ไว้ให้แล้ว (ใช้แสดงผลตาราง)
export type RegistrationWithPlayer = Registration & {
  players: Pick<Player, "name" | "line_name" | "level">;
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
  registration_id: string;
  team: Team;
};

export type QueueEntry = {
  id: string;
  registration_id: string;
  order_index: number;
  joined_at: string;
};
