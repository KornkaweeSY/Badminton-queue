-- รันไฟล์นี้ใน Supabase SQL Editor (ต่อจาก reset.sql ที่รันไปแล้ว)
-- เพิ่มระบบ staff/admin (login) + เช็คอิน + บันทึกผลแมตช์
-- (เขียนให้ปลอดภัย รันซ้ำได้)

-- สิทธิ์ผู้ใช้ ผูกกับ auth.users ของ Supabase Auth
-- ไม่มี public policy — เข้าถึงได้เฉพาะผ่าน secret key ฝั่ง server เท่านั้น (ดู lib/auth.ts)
create table if not exists staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

alter table staff_members enable row level security;

-- เช็คอิน (null = ยังไม่เช็คอิน)
alter table registrations add column if not exists checked_in_at timestamptz;

-- ผลแมตช์ + ผูกกับ session
alter table matches add column if not exists session_id uuid references sessions(id) on delete cascade;
alter table matches drop constraint if exists matches_result_check;
alter table matches add column if not exists result text;
alter table matches add constraint matches_result_check check (result in ('team_a', 'team_b', 'draw'));
alter table matches add column if not exists score_a integer;
alter table matches add column if not exists score_b integer;

-- เสมอ ก็นับสถิติได้ (คู่กับ wins/losses ที่มีอยู่แล้ว)
alter table players add column if not exists draws integer not null default 0;

-- คิวคำนวณสดจาก checked_in_at แทน ไม่ต้อง maintain ลำดับแยกต่างหาก
drop table if exists queue_entries;

-- ตัวอย่าง: ตั้งบัญชีแรกเป็น admin (รันเองหลังสร้าง user ผ่าน Supabase Dashboard -> Authentication -> Add user)
-- insert into staff_members (user_id, role) values ('<uuid จากหน้า Authentication>', 'admin');
