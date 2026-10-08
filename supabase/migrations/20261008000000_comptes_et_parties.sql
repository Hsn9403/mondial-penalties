-- Mondial Penalties : comptes joueurs, parties et classement mondial.
-- À coller tel quel dans Supabase → SQL Editor → Run (ou `supabase db push`).

/* ----------------------------- Profils ----------------------------- */
-- un profil par compte, créé automatiquement à l'inscription (Google ou e-mail)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Anonyme'
               check (char_length(display_name) between 1 and 24),
  created_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- les pseudos sont publics (ils apparaissent au classement), rien d'autre
create policy "profils lisibles par tous" on public.profiles
  for select using (true);
create policy "chacun modifie son propre profil" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

grant select on public.profiles to anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Anonyme'), 24)
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* ----------------------------- Parties ----------------------------- */
-- une ligne = un Mondial joué jusqu'au bout (élimination ou titre)
create table public.games (
  id            bigint generated always as identity primary key,
  user_id       uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  nation        text not null check (char_length(nation) <= 40),
  flag          text not null default '' check (char_length(flag) <= 16),
  round_reached smallint not null check (round_reached between 0 and 4),
  champion      boolean not null default false,
  goals         smallint not null default 0 check (goals between 0 and 200),
  saves         smallint not null default 0 check (saves between 0 and 200),
  conceded      smallint not null default 0 check (conceded between 0 and 200),
  points        integer not null check (points between 0 and 2000),
  created_at    timestamptz not null default now()
);
create index games_user_idx   on public.games (user_id);
create index games_points_idx on public.games (points desc, created_at);
alter table public.games enable row level security;

create policy "chacun enregistre ses parties" on public.games
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "chacun lit ses parties" on public.games
  for select to authenticated using ((select auth.uid()) = user_id);

grant select, insert on public.games to authenticated;

/* ---------------------------- Classement --------------------------- */
-- seule porte d'accès publique aux parties : pseudo + score, jamais l'identifiant
create function public.leaderboard(lim integer default 50)
returns table (
  name text, nation text, flag text, round_reached smallint, champion boolean,
  goals smallint, saves smallint, points integer, created_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select p.display_name, g.nation, g.flag, g.round_reached, g.champion,
         g.goals, g.saves, g.points, g.created_at
  from public.games g
  join public.profiles p on p.id = g.user_id
  order by g.points desc, g.created_at asc
  limit least(greatest(lim, 1), 100);
$$;
revoke execute on function public.leaderboard(integer) from public;
grant execute on function public.leaderboard(integer) to anon, authenticated;
