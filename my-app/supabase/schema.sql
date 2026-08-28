-- รันไฟล์นี้ใน Supabase Dashboard -> SQL Editor -> New query -> Run
-- (โปรเจกต์: Badminton, https://afygltscbgkcvnsfhiqq.supabase.co)
-- ใช้สำหรับตั้งโปรเจกต์ Supabase ใหม่ตั้งแต่ศูนย์เท่านั้น — ถ้ามีตารางเดิมอยู่แล้วและอยากรีเซ็ตให้ตรงกับโค้ดล่าสุด ใช้ supabase/reset.sql แทน

create extension if not exists "pgcrypto";

-- สิทธิ์ผู้ใช้ (staff/admin) ผูกกับ auth.users ของ Supabase Auth
-- ไม่มี public policy — เข้าถึงได้เฉพาะผ่าน secret key ฝั่ง server เท่านั้น (ดู lib/auth.ts)
create table if not exists staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- ตัวตนถาวรของผู้เล่น (คงอยู่ข้ามวัน) เก็บ level ปัจจุบัน + สถิติสะสม — ไม่ซ้ำต่อการลงทะเบียนแต่ละครั้ง
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  line_name text not null,
  level integer check (level between 1 and 6), -- 1=มือใหม่ 2=BG 3=N 4=S 5=P 6=P+
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists players_name_line_key on players (name, line_name);

-- 1 แถว = การเปิดรับสมัครของ 1 วันเล่น (สโมสรเล่น 3-7 วัน/สัปดาห์ แต่ละวันแยกรอบกัน)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  play_date date not null unique,
  capacity integer not null default 14,
  created_at timestamptz not null default now()
);

-- คนลงชื่อเข้าเล่นในแต่ละรอบ ผูกกับ player ตัวจริง — ลำดับสมัคร (created_at) เกิน capacity ของ session = สำรอง
-- checked_in_at: null = ยังไม่เช็คอิน ต้องเช็คอินก่อนถึงจะเข้าคิวรอลงคอร์ตได้จริง
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  notes text,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists registrations_session_player_key on registrations (session_id, player_id);
create index if not exists registrations_session_idx on registrations (session_id, created_at);
create index if not exists registrations_player_idx on registrations (player_id);

create table if not exists courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'idle' check (status in ('idle', 'playing'))
);

-- result: บันทึกตอนจบแมตช์ (บังคับ) — score_a/score_b ไม่บังคับ
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  court_id uuid not null references courts(id) on delete cascade,
  status text not null default 'playing' check (status in ('playing', 'finished')),
  result text check (result in ('team_a', 'team_b', 'draw')),
  score_a integer,
  score_b integer,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists match_players (
  match_id uuid not null references matches(id) on delete cascade,
  registration_id uuid not null references registrations(id) on delete cascade,
  team text not null check (team in ('A', 'B')),
  primary key (match_id, registration_id)
);

create index if not exists match_players_match_idx on match_players (match_id);
create index if not exists match_players_registration_idx on match_players (registration_id);
create index if not exists matches_session_idx on matches (session_id, status);

-- Row Level Security: เปิดทุกตาราง
alter table staff_members enable row level security;
alter table players enable row level security;
alter table sessions enable row level security;
alter table registrations enable row level security;
alter table courts enable row level security;
alter table matches enable row level security;
alter table match_players enable row level security;

-- อ่านได้แบบ public เพราะบอร์ดคิว/รายชื่อต้องแสดงผลได้โดยไม่ต้อง login
-- (staff_members ไม่มี public policy เลย — ตั้งใจ)
-- การเขียน (insert/update/delete) ไม่มี policy ให้ = ถูกบล็อกฝั่ง client โดย default
-- ต้องเขียนผ่าน API route ฝั่ง server ที่ใช้ secret key เท่านั้น
create policy "public read players" on players for select using (true);
create policy "public read sessions" on sessions for select using (true);
create policy "public read registrations" on registrations for select using (true);
create policy "public read courts" on courts for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read match_players" on match_players for select using (true);

-- เปิด Realtime ให้ตารางที่บอร์ดต้องอัปเดตสด
alter publication supabase_realtime add table courts, matches, registrations;

-- ไม่ seed คอร์ตแล้ว — เพิ่มเองผ่านหน้า /queue (ต้อง login เป็น admin) ได้เลย

-- ทำบัญชีแรกให้เป็น admin: สร้าง user ก่อนผ่าน Supabase Dashboard -> Authentication -> Add user
-- แล้วรันบรรทัดข้างล่างนี้เอง (แทน <uuid> ด้วย User UID จากหน้า Authentication)
-- insert into staff_members (user_id, role) values ('<uuid>', 'admin');
