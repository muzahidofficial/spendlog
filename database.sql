create extension if not exists pgcrypto;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  reason text not null,
  amount numeric(12,2) not null check (amount > 0),
  spent_by text not null,
  category text not null default 'Other',
  date date not null,
  time time not null,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.item_requests (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  requested_by text not null,
  quantity integer not null default 1 check (quantity > 0),
  priority text not null default 'Normal' check (priority in ('Low','Normal','High','Urgent')),
  notes text default '',
  status text not null default 'Pending' check (status in ('Pending','Approved','Purchased','Restocked','Completed','Rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expenses enable row level security;
alter table public.item_requests enable row level security;
-- No browser policies are created intentionally. The app talks to Supabase only through Vercel serverless functions using the service-role key.
