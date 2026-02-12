-- 在 Supabase SQL Editor 中运行此脚本
-- https://supabase.com/dashboard/project/amdgywyzyvfcoziefcgy/sql

-- 创建游戏历史表
create table if not exists game_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  config_name text not null,
  player_count int not null,
  has_sheriff boolean default true,
  players jsonb not null,
  notes text,
  wolves int default 0,
  good int default 0,
  alive int default 0,
  result text,
  game_events jsonb,
  created_at timestamp with time zone default now()
);

-- 创建索引加速查询
create index if not exists game_history_user_id_idx on game_history(user_id);
create index if not exists game_history_created_at_idx on game_history(created_at desc);

-- 启用行级安全 (RLS)
alter table game_history enable row level security;

-- 策略: 用户只能查看自己的数据
create policy "Users can view own game history" on game_history
  for select using (auth.uid() = user_id);

-- 策略: 用户只能插入自己的数据
create policy "Users can insert own game history" on game_history
  for insert with check (auth.uid() = user_id);

-- 策略: 用户只能删除自己的数据
create policy "Users can delete own game history" on game_history
  for delete using (auth.uid() = user_id);

-- 新增列 (对已有表执行迁移)
ALTER TABLE game_history ADD COLUMN IF NOT EXISTS result text;
ALTER TABLE game_history ADD COLUMN IF NOT EXISTS game_events jsonb;
