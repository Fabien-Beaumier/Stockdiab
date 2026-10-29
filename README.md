# StockDiab

PWA de gestion de stock de matériel personnel. Interface en français, données 100 % locales (IndexedDB), aucun compte, aucun serveur, aucune collecte. Aucun calcul médical : tous les retraits sont manuels.

## Structure
- index.html, styles.css, app.js (interface), logic.js (règles de stock, testées)
- sw.js (cache hors ligne), manifest.webmanifest, icons/
- vendor/html5-qrcode.min.js (scanner embarqué, version 2.3.8, aucun CDN)
- test/logic.test.mjs

## Exécution locale
    npm install      (inutile pour utiliser l'app : la bibliothèque est déjà dans vendor/)
    npm test         (12 tests de la logique)
    npm start        (serveur sur http://localhost:8080)

localhost est considéré comme sécurisé : caméra et service worker y fonctionnent.

## Déploiement HTTPS
La caméra et le service worker exigent HTTPS (hors localhost). Déposez le dossier tel quel sur un hébergement statique HTTPS : GitHub Pages, Netlify, Cloudflare Pages. Aucune étape de build.

## Installer sur Android (Chrome)
1. Ouvrez l'adresse HTTPS dans Chrome.
2. Attendez le premier chargement complet.
3. Menu (trois points) > « Ajouter à l'écran d'accueil » / « Installer l'application ».
4. Autorisez la caméra au premier scan.

## Invitation d'installation
Sur smartphone, une fenêtre propose d'installer l'application (pas si elle est déjà installée ; « Plus tard » la masque 14 jours).
- Android (Chrome) : bouton « Installer » qui lance l'installation native.
- iOS : Apple ne permet pas de déclencher l'installation. La fenêtre explique la marche à suivre dans Safari (Partager, puis « Sur l'écran d'accueil »).

## Mode sombre
Accueil > Thème : automatique (suit le réglage du téléphone), clair ou sombre. Le choix est mémorisé sur l'appareil.

## Mises à jour
Modifiez la constante V dans sw.js (stockdiab-v2, etc.) à chaque nouvelle version. Les données IndexedDB ne sont jamais effacées par une mise à jour.

## Sauvegarde
Accueil > Exporter (JSON). Vider les données de Chrome, désinstaller l'app ou perdre le téléphone supprime les données : exportez régulièrement.

## Dépendances
html5-qrcode 2.3.8 (embarquée). Aucune autre.

## Scanner et langues
- Lit les codes-barres 1D, QR et Datamatrix. Pour un Datamatrix GS1, l'article est reconnu par son GTIN ; lot et péremption sont proposés dans la fiche, à vérifier.
- Langues : français, anglais, espagnol (Accueil > Langue). Pour en ajouter une, compléter i18n.js.
- Barre de pourcentage : quantité restante rapportée au « stock de référence » saisi dans la fiche, sinon au plus haut niveau atteint.

## Limites connues
- Un lot = une fiche : pour des lots à péremptions différentes, créez une fiche par lot (même nom, codes-barres distincts ou vides). Un même code-barres ne peut servir qu'à une fiche.
- La liste « À racheter » est affichée sur l'Accueil.
- Pas d'icônes dans l'interface (texte seul) ; icône d'application simple.
- Reconnaissance des codes-barres dépendante de la lumière et de la caméra ; saisie manuelle toujours disponible.
- Interface non testée sur appareil réel à ce stade (voir tests dans la réponse).
