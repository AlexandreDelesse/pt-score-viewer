# Pont cookie Pilotest

Petite extension de navigateur (Chrome/Edge/Brave, Manifest V3) qui transmet
automatiquement la session pilotest.com à l'app pt-score-viewer, pour éviter
de copier le cookie à la main à chaque fois qu'il expire.

Elle ne contourne rien : c'est toujours toi qui te connectes et résous le
captcha sur pilotest.com. L'extension se contente de lire le cookie de
session déjà présent dans ton navigateur et de le transmettre à l'app quand
elle en a besoin.

## Installation (mode développeur)

1. Ouvre `chrome://extensions` (ou l'équivalent Edge/Brave).
2. Active le "Mode développeur" en haut à droite.
3. Clique sur "Charger l'extension non empaquetée".
4. Sélectionne ce dossier (`extension/`).

## Utilisation

1. Connecte-toi normalement sur https://www.pilotest.com (résous le captcha
   comme d'habitude).
2. Recharge l'app pt-score-viewer.
3. La session est récupérée automatiquement — plus besoin de rien coller.

## Comment ça marche

- `content.js` s'injecte uniquement sur les pages de l'app (localhost:5173,
  localhost:4173, piscovi.ade-dev.fr) et signale sa présence.
- Quand l'app le lui demande, `content.js` relaie la demande à `background.js`.
- `background.js` lit les cookies du domaine `pilotest.com` (permission
  `cookies`, accordée à l'installation) et les renvoie — uniquement pour les
  onglets ouverts sur l'app elle-même, jamais pour un autre site.
- L'app envoie ensuite ce cookie à `server.js` via `POST /configure`, exactement
  comme avec le copier-coller manuel.
