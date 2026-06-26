-- Run this in the Supabase SQL editor to set up the database schema.

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  notes text,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

create table exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references workouts(id) on delete cascade not null,
  name text not null,
  "order" int not null default 0
);

create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references exercises(id) on delete cascade not null,
  set_number int not null,
  reps int,
  weight_kg numeric(6, 2),
  duration_seconds int,
  notes text
);

-- Row-level security (enforce via server using service role key instead)
alter table workouts enable row level security;
alter table exercises enable row level security;
alter table workout_sets enable row level security;
