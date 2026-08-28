export type StaffRole = "admin" | "staff";

export type StaffMember = {
  user_id: string;
  role: StaffRole;
  created_at: string;
};

export type Player = {
  id: string;
  name: string;
  line_name: string;
  level: number | null;
  wins: number;
  losses: number;
  draws: number;
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
  checked_in_at: string | null;
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
export type MatchResult = "team_a" | "team_b" | "draw";

export type Match = {
  id: string;
  session_id: string;
  court_id: string;
  status: MatchStatus;
  result: MatchResult | null;
  score_a: number | null;
  score_b: number | null;
  started_at: string;
  finished_at: string | null;
};

export type Team = "A" | "B";

export type MatchPlayer = {
  match_id: string;
  registration_id: string;
  team: Team;
};
