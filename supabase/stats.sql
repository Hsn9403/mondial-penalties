-- Tableau de bord : à lancer dans Supabase → SQL Editor (accès propriétaire uniquement).

-- Totaux
select
  (select count(*) from public.profiles)                                         as joueurs_inscrits,
  (select count(*) from public.games)                                            as parties_jouees,
  (select count(distinct user_id) from public.games)                             as joueurs_ayant_joue,
  (select count(*) from public.profiles where created_at > now() - interval '7 days') as inscrits_7_jours,
  (select count(*) from public.games    where created_at > now() - interval '7 days') as parties_7_jours;

-- Activité par jour (30 derniers jours)
select d::date as jour,
       (select count(*) from public.profiles p where p.created_at::date = d::date) as inscriptions,
       (select count(*) from public.games g    where g.created_at::date = d::date) as parties,
       (select count(distinct user_id) from public.games g where g.created_at::date = d::date) as joueurs_actifs
from generate_series(current_date - 29, current_date, interval '1 day') d
order by jour desc;

-- Joueurs les plus assidus
select p.display_name, u.email, count(g.id) as parties, max(g.points) as meilleur_score,
       count(*) filter (where g.champion) as titres, max(g.created_at) as derniere_partie
from public.profiles p
join auth.users u on u.id = p.id
left join public.games g on g.user_id = p.id
group by p.id, p.display_name, u.email
order by parties desc
limit 50;
