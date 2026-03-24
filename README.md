# Galileo

Jeu de géolocalisation par satellite. Une vue satellite s'affiche — à toi de trouver où tu es dans le monde.

## Modes de jeu

| Mode | Description |
|---|---|
| **Monde libre** | 60 lieux répartis sur toute la planète |
| **Capitales** | 145 capitales à identifier parmi des pins sur la carte |
| **Villes de France** | 10 grandes métropoles françaises |
| **Villes d'Europe** | 10 villes emblématiques du continent |
| **Chronologie** | Sous-thèmes : tout (28), + **barrages** (5) : bas (août 2022) → haut (juin 2024) → actuel. **Glaciers** : été **2014** → été **2020** → actuel (Wayback). Multiplicateur = **zoom** uniquement. |

## Mécanique de score

- 5 manches par partie, max **5 000 pts** par manche (25 000 au total)
- Démarrage à **×5** (~10 km de vue)
- Changer d'échelle (zoom) **réduit définitivement** le multiplicateur (les années en mode Chronologie ne modifient pas le ×)
- Formule : `score = 1 000 × mult × e^(−km / 2 000)`

## Structure

```
├── index.html        Landing page
├── game.html         Page de jeu
├── css/style.css     Styles
├── data/             Données par mode (+ `timeline.js` : thèmes, lieux, `eras` Wayback)
└── js/               Logique de jeu (game.js, scoring.js)
```

## Stack

Vanilla HTML / CSS / JS — modules ES natifs, Leaflet.js, aucun bundler.

## Déploiement

Hébergé sur [Vercel](https://vercel.com) en site statique. Aucune étape de build requise.
