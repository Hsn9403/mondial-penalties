-- Mondial Penalties : un e-mail à l'administrateur à chaque nouveau joueur inscrit.
-- Envoi via l'API Resend, appelée depuis Postgres (pg_net, asynchrone : l'inscription
-- n'attend jamais l'e-mail, et un échec d'envoi ne bloque jamais une inscription).
--
-- Les deux secrets vivent dans le coffre Supabase (Vault), jamais dans le code :
--   select vault.create_secret('re_…',              'resend_api_key');
--   select vault.create_secret('vous@exemple.com',  'notify_email');

create extension if not exists pg_net with schema extensions;

/* envoi d'un e-mail à l'administrateur (réservé à la base : non appelable depuis le site) */
create or replace function public.send_admin_mail(subject text, html text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  api_key text;
  dest    text;
begin
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'resend_api_key';
  select decrypted_secret into dest    from vault.decrypted_secrets where name = 'notify_email';
  if api_key is null or dest is null then
    raise warning 'send_admin_mail : secrets resend_api_key / notify_email absents du Vault';
    return;
  end if;
  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || api_key,
                                  'Content-Type',  'application/json'),
    body    := jsonb_build_object('from',    'Mondial Penalties <onboarding@resend.dev>',
                                  'to',      jsonb_build_array(dest),
                                  'subject', subject,
                                  'html',    html)
  );
end $$;
revoke execute on function public.send_admin_mail(text, text) from public, anon, authenticated;

/* déclencheur : nouveau profil → e-mail */
create or replace function public.notify_new_player()
returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  total bigint;
  mail  text;
  nom   text := replace(replace(replace(new.display_name, '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
begin
  select count(*) into total from public.profiles;
  select email into mail from auth.users where id = new.id;
  perform public.send_admin_mail(
    '⚽ Nouveau joueur : ' || new.display_name,
    format('<p><b>%s</b> (%s) vient de créer son compte sur Mondial Penalties.</p>'
           '<p>Total : <b>%s</b> joueur%s inscrit%s.</p>',
           nom, coalesce(mail, 'e-mail inconnu'), total,
           case when total > 1 then 's' else '' end,
           case when total > 1 then 's' else '' end)
  );
  return new;
exception when others then
  -- l'alerte est un bonus : elle ne doit jamais empêcher quelqu'un de s'inscrire
  raise warning 'notify_new_player : %', sqlerrm;
  return new;
end $$;
revoke execute on function public.notify_new_player() from public, anon, authenticated;

create trigger on_profile_created_notify
  after insert on public.profiles
  for each row execute function public.notify_new_player();
