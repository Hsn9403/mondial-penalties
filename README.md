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
