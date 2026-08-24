-- รันไฟล์นี้ใน Supabase Dashboard -> SQL Editor -> New query -> Run
-- (โปรเจกต์: Badminton, https://afygltscbgkcvnsfhiqq.supabase.co)

create extension if not exists "pgcrypto";

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  line_name text,
  position text,
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'idle' check (status in ('idle', 'playing'))
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  status text not null default 'playing' check (status in ('playing', 'finished')),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists match_players (
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  team text not null check (team in ('A', 'B')),
  primary key (match_id, player_id)
);

create table if not exists queue_entries (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  order_index integer not null,
  joined_at timestamptz not null default now()
);

create index if not exists queue_entries_order_idx on queue_entries (order_index);
create index if not exists match_players_match_idx on match_players (match_id);
create index if not exists match_players_player_idx on match_players (player_id);

-- Row Level Security: เปิดทุกตาราง
alter table players enable row level security;
alter table courts enable row level security;
alter table matches enable row level security;
alter table match_players enable row level security;
alter table queue_entries enable row level security;

-- อ่านได้แบบ public เพราะบอร์ดคิวต้องแสดงผลได้โดยไม่ต้อง login
-- การเขียน (insert/update/delete) ไม่มี policy ให้ = ถูกบล็อกฝั่ง client โดย default
-- ต้องเขียนผ่าน API route ฝั่ง server ที่ใช้ service role key เท่านั้น
create policy "public read players" on players for select using (true);
create policy "public read courts" on courts for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read match_players" on match_players for select using (true);
create policy "public read queue_entries" on queue_entries for select using (true);

-- เปิด Realtime ให้ตารางที่บอร์ดต้องอัปเดตสด
alter publication supabase_realtime add table courts, matches, queue_entries;

-- ข้อมูลตัวอย่าง: คอร์ต 3 สนาม (แก้จำนวน/ชื่อได้ตามจริง)
insert into courts (name)
select v.name from (values ('คอร์ต 1'), ('คอร์ต 2'), ('คอร์ต 3')) as v(name)
where not exists (select 1 from courts);
