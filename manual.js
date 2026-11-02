// Notice d'utilisation de StockDiab : chapitres + recherche (sans dépendance au DOM, testable avec Node).
// Convention : pas d'entités HTML (&...;) dans les textes, pour que la mise en surbrillance reste fiable.
import { t, getLang } from './i18n.js';
import { TR, TAGS_I18N } from './manual-i18n.js';

export const CHAPTERS = [
  { id: 'demarrer', title: 'Premiers pas', keys: 'présentation navigation onglets accueil démarrer découvrir',
    html: `<p>StockDiab sert à suivre le matériel (insuline, capteurs, cathéters, bandelettes, piles…) et à savoir quand le racheter. Tout est enregistré uniquement sur votre téléphone : pas de compte, pas de serveur.</p>
<p>La barre du bas contient les cinq onglets :</p>
<ul><li><b>Accueil</b> : le nombre de références, d'articles sous le seuil et d'articles épuisés, la liste « À racheter », les péremptions proches et le bouton « Mes alarmes ».</li>
<li><b>Mon stock</b> : tous vos articles (onglet « Matériel ») et vos ordonnances (onglet « Mes ordonnances »).</li>
<li><b>Ajouter</b> : scanner un article ou créer une fiche à la main.</li>
<li><b>Historique</b> : tous les mouvements de stock.</li>
<li><b>Paramètres</b> : langue, thème, sauvegarde, notice, à propos.</li></ul>
<p>Pour commencer : ouvrez « Ajouter », créez vos premiers articles, puis réglez le seuil d'alerte de chacun.</p>` },

  { id: 'ajout', title: 'Ajouter un article', keys: 'ajout ajouter créer nouvelle fiche article nouveau manuellement scanner unité quantité initiale seuil code-barres lot péremption notes catégorie',
    html: `<p>Onglet <b>Ajouter</b>, deux possibilités :</p>
<ul><li><b>Scanner un article</b> : la caméra lit le code de la boîte (voir le chapitre « Scanner un code »).</li>
<li><b>Créer une fiche manuellement</b> : un formulaire s'ouvre.</li></ul>
<p>Champs de la fiche :</p>
<ul><li><b>Nom du produit</b> (obligatoire) et <b>Catégorie</b> (facultative, utile pour la recherche).</li>
<li><b>Unité de comptage</b> : pièce, boîte, stylo, fiole, cartouche, cathéter, réservoir, capteur, pile, bandelette, ou une unité de votre choix.</li>
<li><b>Quantité initiale</b> : nombre entier. Si elle est supérieure à 0, un mouvement « Entrée » (« Création de la fiche ») est ajouté à l'historique.</li>
<li><b>Seuil d'alerte</b> : l'article passe en « Stock faible » quand la quantité est inférieure ou égale au seuil (1 par défaut).</li>
<li><b>Code-barres</b> (facultatif) : deux articles ne peuvent pas avoir le même code.</li>
<li><b>Date de péremption</b> et <b>Numéro de lot</b> (facultatifs).</li>
<li><b>Stock de référence</b> (facultatif) : la quantité qui correspond à 100 % de la barre de stock.</li>
<li><b>Consommation moyenne</b> (facultatif) : voir le chapitre « Estimation de consommation ».</li>
<li><b>Notes</b> : texte libre, 500 caractères maximum.</li></ul>
<p>Vous pouvez modifier une fiche plus tard avec le bouton « Fiche » de l'article.</p>` },

  { id: 'stock', title: 'Gérer son stock au quotidien', keys: 'mon stock retirer ajouter retrait entrée sortie correction quantité recherche filtre carte réduire déployer bouton',
    html: `<p>Dans <b>Mon stock</b>, chaque article est une carte avec quatre boutons :</p>
<ul><li><b>Retirer 1</b> : retire une unité après confirmation (grisé quand le stock est à 0).</li>
<li><b>Retirer…</b> : retire la quantité de votre choix, avec une note facultative. Impossible de retirer plus que ce qu'il reste.</li>
<li><b>Ajouter</b> : ajoute la quantité reçue (réapprovisionnement), avec une note facultative.</li>
<li><b>Fiche</b> : ouvre la fiche pour la modifier ou supprimer l'article.</li></ul>
<p>Tous les retraits sont manuels : l'application ne calcule aucune dose et ne retire rien toute seule.</p>
<p>Si le nombre affiché est faux, modifiez la quantité dans la fiche : la différence est enregistrée comme « Correction » dans l'historique.</p>
<p><b>Rechercher et filtrer</b> : le champ de recherche cherche dans le nom, la catégorie et le code-barres. Les filtres sont « Tous », « Stock faible », « Épuisés » et « Péremption proche ».</p>
<p><b>Réduire une carte</b> : touchez le nom du produit (flèche ▾) pour ne garder que le nom, la quantité et la barre de stock. Touchez-le à nouveau pour rouvrir la carte. Le bouton « Tout réduire » / « Tout déployer » agit sur toutes les cartes affichées. Votre choix est mémorisé sur l'appareil.</p>
<p><b>Les trois états d'un article</b> : « Stock suffisant » (quantité au-dessus du seuil), « Stock faible » (quantité inférieure ou égale au seuil) et « Épuisé » (quantité à 0).</p>` },

  { id: 'barre', title: 'Barre de stock et pourcentage', keys: 'barre pourcentage progression référence stock de référence niveau 100',
    html: `<p>La barre indique la quantité restante par rapport à une référence :</p>
<ul><li>si vous avez renseigné un <b>stock de référence</b> dans la fiche, c'est elle qui représente 100 % ;</li>
<li>sinon, la référence est le <b>plus haut niveau atteint</b> par l'article d'après l'historique (ou sa quantité actuelle si c'est plus).</li></ul>
<p>Conseil : renseignez un stock de référence pour chaque article important. Sans lui, la barre dépend de l'historique : si vous effacez l'historique, la référence redevient la quantité actuelle.</p>` },

  { id: 'conso', title: 'Estimation de consommation', keys: 'consommation moyenne par jour semaine mois année estimation durée autonomie fréquence',
    html: `<p>Dans la fiche d'un article, la ligne <b>Consommation moyenne</b> se présente ainsi : <b>[nombre] par [période]</b>.</p>
<ul><li>Le premier champ est libre : saisissez un nombre (les décimales sont acceptées, par exemple 0,5).</li>
<li>Le second est une liste déroulante : <b>jour</b>, <b>semaine</b>, <b>mois</b> ou <b>année</b>.</li></ul>
<p>Exemples : « 3 par jour », « 1 par semaine », « 2 par mois », « 4 par année ».</p>
<p>Si elle est renseignée, la carte affiche « Estimation indicative : environ N jour(s) de stock » (quantité restante divisée par la consommation, arrondie à l'entier inférieur). Laissez le champ vide pour ne pas avoir d'estimation.</p>
<p>Cette estimation est indicative : elle ne tient pas compte des changements d'habitude.</p>` },

  { id: 'peremption', title: 'Péremption et numéro de lot', keys: 'péremption périmé date expiration lot bientôt 30 jours',
    html: `<p>Renseignez la <b>date de péremption</b> dans la fiche (et le <b>lot</b> si vous le souhaitez).</p>
<ul><li>À moins de 30 jours de la date, la carte indique « bientôt périmé ».</li>
<li>Une fois la date dépassée, elle indique « PÉRIMÉ ».</li>
<li>Ces articles apparaissent dans la rubrique « Péremption » de l'Accueil et dans le filtre « Péremption proche » de Mon stock.</li></ul>
<p>Une seule date et un seul lot par fiche : si vous avez plusieurs lots, vérifiez la date la plus proche.</p>` },

  { id: 'scanner', title: 'Scanner un code', keys: 'scanner scan caméra code-barres qr datamatrix gs1 photo galerie saisie manuelle lecture',
    html: `<p>Dans <b>Ajouter > Scanner un article</b>, pointez la caméra arrière vers le code.</p>
<ul><li>Codes lus : code-barres, QR code et Datamatrix, y compris les Datamatrix pointillés gravés sur les boîtes de médicaments.</li>
<li>Si l'article existe déjà (même code-barres), une fenêtre vous propose directement d'<b>ajouter</b> la quantité reçue.</li>
<li>Sinon, une nouvelle fiche s'ouvre avec le code déjà rempli. Pour un Datamatrix GS1, le lot et la péremption sont proposés : <b>vérifiez-les</b>.</li></ul>
<p>Si la lecture en direct ne marche pas :</p>
<ul><li>choisissez une <b>image du code</b> (galerie ou fichiers) : l'application analyse la photo ;</li>
<li>ou utilisez la <b>saisie manuelle du code</b>, puis « Valider le code ».</li></ul>
<p>Conseils : bonne lumière, code net et bien cadré, éviter les reflets sur les boîtes brillantes. La caméra demande une autorisation la première fois.</p>` },

  { id: 'alarmes', title: 'Alarmes et rappels', keys: 'alarme alarmes rappel rappels notification calendrier ics répéter jours heure cathéter capteur changement',
    html: `<p>Les alarmes servent aux rappels récurrents (changement de cathéter, de capteur, de stylo…). Accès : <b>Accueil > Mes alarmes</b>.</p>
<p>Pour en créer une : « Nouvelle alarme », puis</p>
<ul><li><b>Nom du rappel</b> (libre ; des suggestions sont proposées) ;</li>
<li><b>Heure</b> ;</li>
<li><b>Répéter tous les (jours)</b> : un nombre entier de 1 à 365 ;</li>
<li><b>Date de la première alarme</b>.</li></ul>
<p>Aucune fréquence n'est imposée : choisissez celle qui vous convient.</p>
<p>Pour chaque alarme : la case <b>Active</b> la met en pause ou la réactive, « Modifier » change ses réglages, « Supprimer » l'efface.</p>
<p><b>Important : quand l'alarme sonne-t-elle ?</b></p>
<ul><li>Application <b>ouverte</b> (ou qui revient au premier plan) : une fenêtre s'affiche, avec une notification si vous l'avez autorisée. Si plusieurs rappels ont été manqués, seul le dernier est affiché.</li>
<li>Application <b>fermée</b> : StockDiab ne peut pas réveiller le téléphone. Utilisez « <b>Ajouter au calendrier</b> » : un fichier est créé, à ouvrir avec l'application Calendrier du téléphone, qui crée un événement récurrent avec rappel.</li></ul>` },

  { id: 'ordonnances', title: 'Ordonnances', keys: 'ordonnance ordonnances document photo pdf scanner pages titre date notes',
    html: `<p>Allez dans <b>Mon stock > Mes ordonnances > Scanner une ordonnance</b>.</p>
<ul><li>Prenez une photo, ou choisissez une image ou un PDF existant. Vous pouvez ajouter plusieurs pages.</li>
<li>Donnez un titre, une date et des notes si vous le souhaitez.</li>
<li>Sur la carte : « Voir », « Modifier » ou « Supprimer ».</li></ul>
<p>Les images sont réduites (1800 pixels maximum) et restent sur le téléphone. Il n'y a ni recadrage automatique ni reconnaissance de texte. Elles ne sont pas chiffrées : activez le verrouillage d'écran. Les ordonnances sont incluses dans la sauvegarde, qui devient plus volumineuse.</p>` },

  { id: 'historique', title: 'Historique et effacement', keys: 'historique mouvements entrée sortie correction filtre effacer supprimer historique journal',
    html: `<p>L'onglet <b>Historique</b> liste tous les mouvements, du plus récent au plus ancien : type (Entrée, Sortie ou Correction), quantité, stock avant et après, date, heure et note.</p>
<p>Filtres : par <b>article</b> et par <b>type</b> de mouvement.</p>
<p><b>Effacer l'historique</b> : le bouton du même nom supprime uniquement les mouvements, après confirmation. Vos articles, quantités, ordonnances et alarmes sont conservés. L'action est irréversible : faites une sauvegarde avant si besoin.</p>
<p>Conséquence : pour les articles sans « stock de référence », la barre de stock repart de la quantité actuelle.</p>
<p>Si vous supprimez un article, son historique est conservé.</p>` },

  { id: 'parametres', title: 'Paramètres', keys: 'paramètres réglages langue thème sombre clair automatique à propos soutenir coffee notice',
    html: `<p>L'onglet <b>Paramètres</b> contient :</p>
<ul><li><b>Langue</b> : français, anglais ou espagnol.</li>
<li><b>Thème</b> : automatique (suit le réglage du téléphone), clair ou sombre.</li>
<li><b>Notice d'utilisation</b> : cette page.</li>
<li><b>Sauvegarde</b> : exporter, restaurer, effacer toutes les données (voir le chapitre suivant).</li>
<li><b>À propos</b> : présentation, mentions légales, données personnelles, responsabilité.</li>
<li><b>Soutenir le projet</b> : lien « Buy me a coffee », ouvert uniquement si vous le touchez.</li></ul>
<p>La langue et le thème sont mémorisés sur l'appareil.</p>` },

  { id: 'sauvegarde', title: 'Sauvegarde et restauration', keys: 'sauvegarde sauvegarder exporter export importer restaurer json fichier données perte effacer toutes données',
    html: `<p>Vos données n'existent que sur ce téléphone. Vider les données du navigateur, désinstaller l'application ou perdre le téléphone les efface définitivement : <b>exportez régulièrement</b>.</p>
<ul><li><b>Exporter (JSON)</b> : télécharge un fichier daté contenant articles, historique, alarmes et ordonnances. Gardez-le en lieu sûr (il contient vos ordonnances).</li>
<li><b>Restaurer…</b> : choisissez un fichier exporté. L'application indique ce qu'il contient et demande confirmation, car il <b>remplace toutes les données actuelles</b>.</li>
<li><b>Effacer toutes les données</b> : supprime tout (articles, historique, ordonnances), après confirmation. Irréversible.</li></ul>
<p>Pour changer de téléphone : exportez sur l'ancien, installez l'application sur le nouveau, puis restaurez le fichier.</p>` },

  { id: 'installation', title: 'Installation et mises à jour', keys: 'installer installation écran d\'accueil android iphone ios chrome safari hors ligne mise à jour application',
    html: `<ul><li><b>Android (Chrome)</b> : menu (trois points) > « Installer l'application » ou « Ajouter à l'écran d'accueil ».</li>
<li><b>iPhone (Safari)</b> : bouton Partager > « Sur l'écran d'accueil ».</li></ul>
<p>Une fois installée, l'application fonctionne sans connexion. Elle se met à jour toute seule quand une connexion est disponible (la page se recharge une fois), sans jamais toucher à vos données.</p>` },

  { id: 'depannage', title: 'Dépannage (questions fréquentes)', keys: 'problème aide dépannage erreur ne marche pas caméra alarme disparu faq bloqué',
    html: `<p><b>La caméra ne s'ouvre pas.</b> Autorisez la caméra pour StockDiab dans les réglages du téléphone ou du navigateur. En attendant, utilisez la photo d'un code ou la saisie manuelle.</p>
<p><b>Le code n'est pas reconnu.</b> Rapprochez-vous, améliorez la lumière, évitez les reflets, ou prenez une photo bien nette.</p>
<p><b>Mon alarme n'a pas sonné.</b> C'est normal si l'application était fermée : utilisez « Ajouter au calendrier » (chapitre Alarmes). Vérifiez aussi que la case « Active » est cochée.</p>
<p><b>« Ce code-barres existe déjà ».</b> Un autre article utilise ce code : modifiez-le ou ouvrez l'article existant.</p>
<p><b>« Retrait impossible : il reste N en stock ».</b> Vous essayez de retirer plus que la quantité disponible. Si le stock réel est différent, corrigez la quantité dans la fiche.</p>
<p><b>Le bouton « Retirer 1 » est grisé.</b> La quantité de l'article est à 0.</p>
<p><b>Mes données ont disparu.</b> Elles ont été effacées avec les données du navigateur ou la désinstallation : restaurez votre dernière sauvegarde (Paramètres > Restaurer…).</p>
<p><b>La barre de stock affiche 100 % alors que j'ai consommé.</b> Renseignez un « stock de référence » dans la fiche de l'article.</p>
<p>Une autre question ? Écrivez à l'adresse indiquée dans « À propos ».</p>` },

  { id: 'securite', title: 'Sécurité et limites', keys: 'sécurité confidentialité données médical dispositif santé médecin responsabilité chiffrement verrouillage',
    html: `<p><b>StockDiab n'est pas un dispositif médical.</b> Il ne calcule aucune dose et ne remplace pas l'avis de votre médecin ou de votre équipe soignante.</p>
<ul><li>Vérifiez vous-même vos quantités, lots et dates de péremption : les estimations sont indicatives.</li>
<li>Aucune donnée n'est envoyée à un serveur ; aucun compte, aucun suivi, aucune publicité.</li>
<li>Les données ne sont pas chiffrées sur le téléphone : protégez-le par un verrouillage d'écran.</li>
<li>Exportez régulièrement une sauvegarde.</li></ul>` },
];

// ---------- Recherche ----------
// Minuscules sans accents, longueur inchangée (utile pour la mise en surbrillance).
export const fold = s => Array.from(String(s)).map(c => c.normalize('NFD')[0]).join('').toLowerCase();
const plain = h => h.replace(/<[^>]*>/g, ' ');
const words = q => fold(q).split(/[\s,;]+/).filter(Boolean);

// Chapitres contenant TOUS les mots (titre, mots-clés ou texte), titre/mots-clés en premier.
export function searchManual(q, chapters = CHAPTERS) {
  const w = words(q);
  if (!w.length) return chapters.slice();
  return chapters.map((c, i) => {
    const head = fold(c.title + ' ' + c.keys), all = head + ' ' + fold(plain(c.html));
    return w.every(x => all.includes(x)) ? { c, score: w.every(x => head.includes(x)) ? 0 : 1, i } : null;
  }).filter(Boolean).sort((a, b) => a.score - b.score || a.i - b.i).map(x => x.c);
}

// Entoure les mots trouvés de <mark> (uniquement dans le texte, jamais dans les balises).
export function highlight(html, q) {
  const w = words(q); if (!w.length) return html;
  return html.split(/(<[^>]*>)/).map(part => {
    if (part.startsWith('<')) return part;
    const f = fold(part), r = [];
    w.forEach(x => { for (let i = f.indexOf(x); i >= 0; i = f.indexOf(x, i + x.length)) r.push([i, i + x.length]); });
    if (!r.length) return part;
    r.sort((a, b) => a[0] - b[0]);
    const m = [r[0]]; r.slice(1).forEach(x => { const l = m[m.length - 1]; x[0] <= l[1] ? l[1] = Math.max(l[1], x[1]) : m.push(x); });
    let out = '', p = 0; m.forEach(([a, b]) => { out += part.slice(p, a) + '<mark>' + part.slice(a, b) + '</mark>'; p = b; });
    return out + part.slice(p);
  }).join('');
}

export const TAGS = ['ajout', 'alarme', 'paramètres', 'scanner', 'historique', 'sauvegarde', 'ordonnance', 'péremption'];
export const tagsFor = (lang = getLang()) => TAGS_I18N[lang] || TAGS;
// Chapitres dans la langue demandée (français = texte d'origine). Les mots-clés français restent cherchables dans toutes les langues.
export const chaptersFor = (lang = getLang()) => TR[lang] ? CHAPTERS.map(c => { const x = TR[lang][c.id]; return x ? { ...c, title: x.title, keys: x.keys + ' ' + c.keys, html: x.html } : c; }) : CHAPTERS;

// HTML des résultats : chapitres repliables (ouverts quand une recherche est active).
export function manualHTML(q = '', lang = getLang()) {
  const found = searchManual(q, chaptersFor(lang)), active = words(q).length > 0;
  if (!found.length) return `<p class="small">${t('Aucun résultat. Essayez un autre mot (par exemple « alarme » ou « sauvegarde »).')}</p>`;
  return (active ? `<p class="small">${t('{n} chapitre(s) trouvé(s)', { n: found.length })}</p>` : '') +
    found.map(c => `<details class="chap" ${active ? 'open' : ''}><summary>${highlight(c.title, q)}</summary><div class="chapbody">${highlight(c.html, q)}</div></details>`).join('');
}
