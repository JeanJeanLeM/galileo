# Galileo

Jeu de géolocalisation par satellite. Une vue satellite s'affiche — à toi de trouver où tu es dans le monde.

## Jeu

- **Mode unique** : pool mélangé (paysages, capitales, villes, sites chronologiques)
- **5 manches** par partie, max **1 000 pts** par manche (5 000 au total)
- Vue satellite fixe à **~1 000 km**
- Formule : `score = 1 000 × e^(−km / 2 000)`

## Structure

```
├── index.html        Landing page
├── game.html         Page de jeu
├── css/style.css     Styles
├── data/             Données (mixed.js agrège tous les lieux)
└── js/               Logique de jeu (game.js, scoring.js)
```

## Stack

Vanilla HTML / CSS / JS — modules ES natifs, Leaflet.js, aucun bundler.

## Déploiement

Hébergé sur [Vercel](https://vercel.com) en site statique. Aucune étape de build requise.
