# StockDiab

PWA de gestion de stock de matériel personnel. Interface en français, données 100 % locales (IndexedDB), aucun compte, aucun serveur, aucune collecte. Aucun calcul médical : tous les retraits sont manuels.

## Structure
- index.html, styles.css, app.js (interface), logic.js (règles de stock, testées)
- sw.js (cache hors ligne), manifest.webmanifest, icons/
- decode.js (prétraitement des images du scanner), install.js, i18n.js
- vendor/ : zxing-wasm 3.1.6 (lecteur de codes embarqué, aucun CDN)
- test/logic.test.mjs

## Exécution locale
    npm install      (inutile pour utiliser l'app : la bibliothèque est déjà dans vendor/)
    npm test         (12 tests de la logique)
    npm start        (serveur sur http://localhost:8080)

localhost est considéré comme sécurisé : caméra et service worker y fonctionnent.

## Déploiement HTTPS
La caméra et le service worker exigent HTTPS (hors localhost). Déposez le dossier tel quel sur un hébergement statique HTTPS : GitHub Pages (hébergement actuel), Netlify, Cloudflare Pages. Aucune étape de build.

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
Paramètres > Thème : automatique (suit le réglage du téléphone), clair ou sombre. Le choix est mémorisé sur l'appareil.

## Mises à jour
Modifiez la constante V dans sw.js (stockdiab-v7, etc.) à chaque nouvelle version. L'appli est chargée réseau d'abord (toujours à jour en ligne), puis depuis le cache hors connexion, et la page se recharge seule une fois quand une nouvelle version s'active. Les données IndexedDB ne sont jamais effacées par une mise à jour.

## Sauvegarde
Paramètres > Sauvegarde > Exporter (JSON). Vider les données de Chrome, désinstaller l'app ou perdre le téléphone supprime les données : exportez régulièrement.

## Dépendances
zxing-wasm 3.1.6 (embarquée dans vendor/). Aucune autre.

## Scanner et langues
- Lit les codes-barres 1D, QR et Datamatrix, y compris les Datamatrix pointillés gravés sur les boîtes de médicaments (l'image est réduite et légèrement floutée avant lecture). Si la lecture en direct échoue, « Ou prenez une photo du code » analyse une photo. Pour un Datamatrix GS1, l'article est reconnu par son GTIN ; lot et péremption sont proposés dans la fiche, à vérifier.
- Langues : français, anglais, espagnol (Paramètres > Langue). Pour en ajouter une, compléter i18n.js.
- Barre de pourcentage : quantité restante rapportée au « stock de référence » saisi dans la fiche, sinon au plus haut niveau atteint.

## Soutien
Paramètres > Buy me a coffee ouvre paypal.me/FabienBeaumier (seul lien externe de l'application, utilisé uniquement au clic).

## Ordonnances
Mon stock > Mes ordonnances > Scanner une ordonnance : photo (appareil photo) ou image/PDF existant, plusieurs pages possibles, titre, date et notes. Tout reste dans IndexedDB sur l'appareil (images réduites à 1800 px, JPEG). L'export JSON de sauvegarde contient aussi les ordonnances (en base64), donc il grossit. Pas de recadrage automatique ni de reconnaissance de texte. Les ordonnances ne sont pas chiffrées : verrouillage d'écran recommandé.

## Alarmes
Accueil > Mes alarmes : rappels récurrents (nom libre, heure, tous les N jours, date de départ), par exemple pour un changement de cathéter ou de capteur. Aucune fréquence n'est suggérée : à vous de la choisir.
- Rappel dans l'appli : fenêtre + notification (si autorisée) quand StockDiab est ouvert ou revient au premier plan. Une PWA sans serveur ne peut pas réveiller le téléphone application fermée.
- Pour être prévenu application fermée : « Ajouter au calendrier » télécharge un fichier .ics (événement récurrent avec rappel) à ouvrir avec l'application Calendrier du téléphone.
- Les alarmes sont incluses dans la sauvegarde JSON.

## À propos et mentions légales
Paramètres > À propos : présentation, contact, mentions légales, données personnelles, responsabilité. L'année du copyright se met à jour automatiquement. Si vous changez d'hébergeur, modifiez la ligne « Hébergement » dans app.js (fonction about) et ses traductions dans i18n.js.

## Limites connues
- Un lot = une fiche : pour des lots à péremptions différentes, créez une fiche par lot (même nom, codes-barres distincts ou vides). Un même code-barres ne peut servir qu'à une fiche.
- La liste « À racheter » est affichée sur l'Accueil.
- Pas d'icônes dans l'interface (texte seul) ; icône d'application simple.
- Reconnaissance des codes-barres dépendante de la lumière et de la caméra ; saisie manuelle toujours disponible.
- Interface non testée sur appareil réel à ce stade (voir tests dans la réponse).
