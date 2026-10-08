# ⚽ Mondial Penalties

Jeu de tirs au but en canvas HTML5 : 48 nations, un tournoi à élimination directe
(seizièmes → finale), des gardiens de plus en plus affûtés, des trophées à débloquer
et un classement des meilleurs performeurs.

## Lancer en local

```bash
npm install
npm run dev        # serveur de dev Vite → http://localhost:5173
```

```bash
npm run build      # build de production dans dist/
npm run preview    # sert le build de prod en local
```

## Gameplay

- **Tir** : un clic fige la direction (flèche qui balaie), un second règle la puissance.
- **Gardien** : glissez vers la zone où plonger, relâchez au moment de la frappe.
- **Penalty décisif** : battement de cœur, halo rouge et badge quand le tir peut
  gagner ou perdre le match.
- Clavier : `Espace`/`Entrée` pour tirer, flèches + `Entrée` pour plonger.
- **Mode discret** : `Échap` fige la partie, coupe le son et affiche un tableur de suivi budgétaire
  (titre d'onglet et icône compris). `Échap` à nouveau pour reprendre.
- **Forces réelles** : les nations sont classées selon le classement FIFA (juillet 2026). La force
  pèse sur le tirage (têtes de série), les matchs simulés et la difficulté de vos adversaires.
- **Tableau final** : le tableau s'affiche en arbre, des seizièmes jusqu'à la coupe au centre ;
  après une élimination, le reste du Mondial est simulé jusqu'au sacre.

## Architecture (`src/`)

| Module | Rôle |
|---|---|
| `data.js` | Nations, tours, trophées, messages par stade |
| `state.js` | État global `G`, géométrie du but, courbe de difficulté |
| `audio.js` | Synthèse Web Audio (foule, sifflet, frappe, battement de cœur) |
| `canvas.js` | Canvas, viewport responsive, conversion coordonnées |
| `render.js` | Tout le dessin + boucle `requestAnimationFrame` |
| `match.js` | Déroulé d'une séance : phases de tir, verdicts, mort subite, cinématique |
| `tournament.js` | Tirage, tableau final, simulation des autres matchs |
| `ui.js` | Écrans, HUD, bannières |
| `effects.js` | Foule, confettis, étincelles |
| `trophies.js` | Déblocage et palmarès |
| `leaderboard.js` | Classement des performeurs (localStorage) |
| `main.js` | Menus, câblage des boutons, boot |

## Roadmap

- [ ] Base de données pour le classement mondial — la couche de stockage est isolée
      dans `leaderboard.js` (`Leaderboard.list()` / `Leaderboard.submit()`) : seules
      ces deux fonctions sont à remplacer par l'API distante.
- [ ] Mise en production (build statique : Vercel / Netlify / GitHub Pages).

## Comptes joueurs & classement mondial (Supabase)

Sans configuration, le jeu tourne en mode local (classement sur l'appareil, pas de comptes).
Une fois Supabase configuré, **la connexion Google est obligatoire pour jouer** (pas d'inscription par e-mail).
Pour l'activer :

1. Créer un projet gratuit sur [supabase.com](https://supabase.com).
2. **SQL Editor** → coller et exécuter `supabase/migrations/20261008000000_comptes_et_parties.sql`.
3. Copier `.env.example` en `.env.local` et y mettre l'URL et la clé *publishable* du projet
   (Project Settings → API). Sur Vercel : mêmes variables dans Settings → Environment Variables.
4. **Authentication → URL Configuration** : *Site URL* = l'URL du jeu en prod, et ajouter
   `http://localhost:5173` aux *Redirect URLs*.
5. Google : créer un identifiant OAuth « Application Web » dans Google Cloud Console
   (APIs & Services → Credentials), avec comme *Authorized redirect URI*
   `https://<projet>.supabase.co/auth/v1/callback` ; puis coller Client ID / Secret dans
   Supabase → Authentication → Providers → Google. Ajouter aussi `VITE_GOOGLE_CLIENT_ID` (même Client ID)
   et, dans *Authorized JavaScript origins*, l'URL du jeu + `http://localhost:5173` : le jeu utilise le bouton
   officiel Google (fenêtre ouverte depuis le domaine du jeu, pas celui de Supabase).

Suivi des joueurs et des parties : `supabase/stats.sql` (à lancer dans le SQL Editor).
Une partie = un Mondial terminé (élimination ou titre).
Pour n'autoriser que Google côté serveur aussi : Supabase → Authentication → Sign In / Providers → désactiver *Email*.

### Alerte e-mail à chaque nouveau joueur

`supabase/migrations/20261008120000_alerte_nouveau_joueur.sql` (SQL Editor) installe un trigger qui
envoie un e-mail via [Resend](https://resend.com) à chaque inscription. Secrets à créer dans le Vault :
`select vault.create_secret('re_…','resend_api_key'); select vault.create_secret('vous@exemple.com','notify_email');`
Avec l'expéditeur de test `onboarding@resend.dev`, l'e-mail de destination doit être celui du compte Resend.
