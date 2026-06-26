-- Run this in the Supabase SQL editor.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE.

-- ─── Profiles ────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),

  -- onboarding
  onboarding_completed boolean not null default false,
  goal_weight_kg numeric(5, 2),
  daily_adjustment_kcal int,
  unit_system text check (unit_system in ('metric', 'imperial')),

  -- body metrics
  age int,
  sex text check (sex in ('male', 'female')),
  height_cm numeric(5, 1),
  weight_kg numeric(5, 2),
  body_fat_pct numeric(4, 1),

  -- fitness background
  workout_days_per_week int check (workout_days_per_week between 0 and 7),
  training_level text check (training_level in ('beginner', 'intermediate', 'advanced')),
  equipment text check (equipment in ('gym', 'home', 'none')),

  -- goal
  goal text check (goal in ('lose_weight', 'gain_muscle', 'recomp', 'maintain', 'endurance')),

  -- lifestyle
  activity_level text check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active')),
  injuries text,
  dietary_preference text check (dietary_preference in ('none', 'vegetarian', 'vegan', 'other')),
  workout_split text,

  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table profiles enable row level security;

-- ─── Auto-create profile on signup ──────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Workouts ─────────────────────────────────────────────────────────────────

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

alter table workouts enable row level security;

-- ─── Exercises ────────────────────────────────────────────────────────────────

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references workouts(id) on delete cascade not null,
  name text not null,
  "order" int not null default 0
);

alter table exercises enable row level security;

-- ─── Workout Sets ─────────────────────────────────────────────────────────────

create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references exercises(id) on delete cascade not null,
  set_number int not null,
  reps int,
  weight_kg numeric(6, 2),
  duration_seconds int,
  notes text
);

alter table workout_sets enable row level security;

-- ─── User Exercises ───────────────────────────────────────────────────────────

create table if not exists user_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_id text not null,
  muscle_group text not null,
  unique (user_id, exercise_id)
);

alter table user_exercises enable row level security;

-- ─── AI Messages ──────────────────────────────────────────────────────────────

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now() not null
);

alter table messages enable row level security;
