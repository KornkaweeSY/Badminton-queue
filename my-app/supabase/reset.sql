-- รันไฟล์นี้ใน Supabase SQL Editor แทนการรัน migration ทีละไฟล์
-- ล้างตารางเก่าทั้งหมด (มีแค่ข้อมูลทดสอบ ไม่มีของจริง) แล้วสร้างใหม่ตาม schema ล่าสุดในไฟล์เดียว
-- ใช้ตอนไล่ migration ทีละไฟล์แล้วสับสนว่ารันอะไรไปแล้วบ้าง — เริ่มจากศูนย์ให้ตรงกับโค้ดชัวร์ๆ

drop table if exists match_players cascade;
drop table if exists queue_entries cascade;
drop table if exists matches cascade;
drop table if exists registrations cascade;
drop table if exists players cascade;
drop table if exists sessions cascade;
drop table if exists courts cascade;

create extension if not exists "pgcrypto";

-- ตัวตนถาวรของผู้เล่น (คงอยู่ข้ามวัน) เก็บ level ปัจจุบัน + สถิติสะสม — ไม่ซ้ำต่อการลงทะเบียนแต่ละครั้ง
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  line_name text not null,
  level integer check (level between 1 and 6), -- 1=มือใหม่ 2=BG 3=N 4=S 5=P 6=P+
  wins integer not null default 0,
  losses integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index players_name_line_key on players (name, line_name);

-- 1 แถว = การเปิดรับสมัครของ 1 วันเล่น (สโมสรเล่น 3-7 วัน/สัปดาห์ แต่ละวันแยกรอบกัน)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  play_date date not null unique,
  capacity integer not null default 14,
  created_at timestamptz not null default now()
);

-- คนลงชื่อเข้าเล่นในแต่ละรอบ ผูกกับ player ตัวจริง — ลำดับสมัคร (created_at) เกิน capacity ของ session = สำรอง
create table registrations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now()
);

create unique index registrations_session_player_key on registrations (session_id, player_id);
create index registrations_session_idx on registrations (session_id, created_at);
create index registrations_player_idx on registrations (player_id);

create table courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'idle' check (status in ('idle', 'playing'))
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  status text not null default 'playing' check (status in ('playing', 'finished')),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table match_players (
  match_id uuid not null references matches(id) on delete cascade,
  registration_id uuid not null references registrations(id) on delete cascade,
  team text not null check (team in ('A', 'B')),
  primary key (match_id, registration_id)
);

create table queue_entries (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references registrations(id) on delete cascade,
  order_index integer not null,
  joined_at timestamptz not null default now()
);

create index queue_entries_order_idx on queue_entries (order_index);
create index match_players_match_idx on match_players (match_id);
create index match_players_registration_idx on match_players (registration_id);

-- Row Level Security: เปิดทุกตาราง
alter table players enable row level security;
alter table sessions enable row level security;
alter table registrations enable row level security;
alter table courts enable row level security;
alter table matches enable row level security;
alter table match_players enable row level security;
alter table queue_entries enable row level security;

-- อ่านได้แบบ public เพราะบอร์ดคิว/รายชื่อต้องแสดงผลได้โดยไม่ต้อง login
-- การเขียน (insert/update/delete) ไม่มี policy ให้ = ถูกบล็อกฝั่ง client โดย default
-- ต้องเขียนผ่าน API route ฝั่ง server ที่ใช้ secret key เท่านั้น
create policy "public read players" on players for select using (true);
create policy "public read sessions" on sessions for select using (true);
create policy "public read registrations" on registrations for select using (true);
create policy "public read courts" on courts for select using (true);
create policy "public read matches" on matches for select using (true);
create policy "public read match_players" on match_players for select using (true);
create policy "public read queue_entries" on queue_entries for select using (true);

-- เปิด Realtime ให้ตารางที่บอร์ดต้องอัปเดตสด
alter publication supabase_realtime add table courts, matches, queue_entries, registrations;

-- ข้อมูลตัวอย่าง: คอร์ต 3 สนาม + รอบเล่นวันที่ 26/8/2026 รับ 14 คน (แก้ทีหลังได้)
insert into courts (name) values ('คอร์ต 1'), ('คอร์ต 2'), ('คอร์ต 3');
insert into sessions (play_date, capacity) values ('2026-08-26', 14);
