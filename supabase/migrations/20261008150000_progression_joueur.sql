-- Mondial Penalties : trophées et titres rattachés au compte (et non plus à l'appareil).
-- progress = {"trophies": [...ids], "champs": [...nations], "titles": n}
alter table public.profiles
  add column if not exists progress jsonb not null default '{}'::jsonb
  check (pg_column_size(progress) < 8192);

-- la ligne profil reste lisible par tous (pseudo du classement) : on ne publie pas la progression
revoke select on public.profiles from anon, authenticated;
grant select (id, display_name, created_at) on public.profiles to anon, authenticated;
grant select (progress) on public.profiles to authenticated;
grant update (display_name, progress) on public.profiles to authenticated;
