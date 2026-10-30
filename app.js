import { esc, status, expiry, daysLeft, applyMove, validateBackup, uid, err, norm, parseGS1, refQty, pct, lastOcc, nextOcc, toICS, ratePerDay } from './logic.js';
import './install.js';
import { scanImage } from './decode.js';
import { t, LANGS, getLang, setLang, locale } from './i18n.js';
const getTheme = () => { try { return localStorage.getItem('sd-theme') || ''; } catch { return ''; } };
const setTheme = v => { const r = document.documentElement; v ? r.dataset.theme = v : delete r.dataset.theme; try { v ? localStorage.setItem('sd-theme', v) : localStorage.removeItem('sd-theme'); } catch {} };
const em = x => t(x.tpl || x.message, x.vars); // message d'erreur traduit
const $ = s => document.querySelector(s);
const LBL = { ok: 'Stock suffisant', low: 'Stock faible', out: 'Épuisé' };
const TYPE = { in: 'Entrée', out: 'Sortie', fix: 'Correction' };
const NAV = { stock: 'Mon stock', add: 'Ajouter', home: 'Accueil', hist: 'Historique', settings: 'Paramètres' }; // ordre d'affichage de la barre
const UNITS = ['pièce','boîte','stylo','fiole','cartouche','cathéter','réservoir','capteur','pile','bandelette'];
let db, items = [], moves = [], view = 'home', flt = 'all', q = '', hItem = '', hType = '', busy = false;

// ---------- Stockage IndexedDB ----------
const open = () => new Promise((ok, ko) => { const r = indexedDB.open('stockdiab', 3);
  r.onupgradeneeded = () => { for (const n of ['items', 'moves', 'docs', 'alarms']) if (!r.result.objectStoreNames.contains(n)) r.result.createObjectStore(n, { keyPath: 'id' }); }; // les données existantes sont conservées
  r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
const getAll = s => new Promise((ok, ko) => { const r = db.transaction(s).objectStore(s).getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
const write = fn => new Promise((ok, ko) => { const t = db.transaction(['items', 'moves', 'docs', 'alarms'], 'readwrite'); fn(t.objectStore('items'), t.objectStore('moves'), t.objectStore('docs'), t.objectStore('alarms')); t.oncomplete = ok; t.onerror = t.onabort = () => ko(err('Erreur de stockage local.')); });
async function commit(item, mv) { // écriture atomique article + mouvement
  await write((i, m) => { i.put(item); if (mv) m.put(mv); });
  items = [...items.filter(x => x.id !== item.id), item]; if (mv) moves.push(mv); render();
}
async function move(item, type, n, note) { const r = applyMove(item, type, n, note); await commit(r.item, r.mv); }

// ---------- Fenêtres ----------
function modal(title, body, onOk, label = 'Valider') {
  const d = document.createElement('dialog');
  d.innerHTML = `<form><h2>${esc(title)}</h2>${body}<p class="err" role="alert"></p><div class="row"><button type="button" class="ghost">${t('Annuler')}</button><button class="primary">${t(label)}</button></div></form>`;
  document.body.append(d); d.showModal();
  const f = d.querySelector('form'), er = d.querySelector('.err');
  d.querySelector('.ghost').onclick = () => d.close();
  f.onsubmit = async e => { e.preventDefault(); if (busy) return; busy = true;
    try { await onOk(Object.fromEntries(new FormData(f))); d.close(); } catch (x) { er.textContent = em(x); } finally { busy = false; } };
  d.onclose = () => d.remove(); return d;
}
const F = (l, n, v = '', t = 'text', x = '') => `<label>${l}<input name="${n}" type="${t}" value="${esc(v)}" ${x}></label>`;
const plural = (n, u) => `${n} ${esc(u)}${n > 1 && !/[sx]$/.test(u) ? 's' : ''}`;

function qtyDialog(a, type) {
  const out = type === 'out';
  modal(`${t(out ? 'Retirer' : 'Ajouter au stock')} : ${a.name}`, `<p>${t('Quantité actuelle :')} <b>${plural(a.qty, a.unit)}</b></p>` +
    F(t(out ? 'Quantité à retirer' : 'Quantité reçue'), 'n', 1, 'number', 'min="1" step="1" inputmode="numeric" required') + F(t('Note (facultatif)'), 'note'),
    v => move(a, type, v.n, v.note), out ? 'Retirer' : 'Ajouter');
}
const RATE_LBL = { day: 'jour', month: 'mois', year: 'année' };
function rateField(it) { // « [nombre] par [jour | mois | année] » : le nombre est libre, la période se choisit dans la liste
  const n = it.rateN ?? (it.rate || ''), u = it.rateU || 'day';
  return `<label>${t('Consommation moyenne (facultatif, estimation)')}</label><div class="row rate"><input name="rateN" type="number" min="0" step="any" inputmode="decimal" value="${esc(n)}" aria-label="${esc(t('Quantité consommée'))}"><span class="per">${t('par')}</span><select name="rateU" aria-label="${esc(t('Fréquence'))}">${Object.entries(RATE_LBL).map(([k, l]) => `<option value="${k}" ${k === u ? 'selected' : ''}>${t(l)}</option>`).join('')}</select></div>`;
}
function itemForm(it = {}) {
  const isNew = !it.id;
  const d = modal(t(isNew ? 'Nouvel article' : "Modifier l'article"),
    F(t('Nom du produit'), 'name', it.name, 'text', 'required maxlength="80"') + F(t('Catégorie'), 'cat', it.cat, 'text', 'maxlength="40"') +
    `<label>${t('Unité de comptage')}<input name="unit" list="units" value="${esc(it.unit || t('pièce'))}" required maxlength="20"></label><datalist id="units">${UNITS.map(u => `<option>${esc(t(u))}`).join('')}</datalist>` +
    F(t(isNew ? 'Quantité initiale' : 'Quantité (toute modification est enregistrée comme correction)'), 'qty', it.qty ?? 0, 'number', 'min="0" step="1" required') +
    F(t("Seuil d'alerte (alerte si stock ≤ seuil)"), 'min', it.min ?? 1, 'number', 'min="0" step="1" required') +
    F(t('Code-barres (facultatif)'), 'barcode', it.barcode, 'text', 'inputmode="numeric" maxlength="40"') + F(t('Date de péremption (facultatif)'), 'exp', it.exp, 'date') +
    F(t('Numéro de lot (facultatif)'), 'lot', it.lot) + F(t('Stock de référence = 100 % de la barre (facultatif)'), 'full', it.full || '', 'number', 'min="1" step="1"') + rateField(it) +
    `<label>${t('Notes')}<textarea name="notes" maxlength="500">${esc(it.notes)}</textarea></label>`,
    async v => {
      const name = v.name.trim(), bc = v.barcode.trim(), qty = Number(v.qty), min = Number(v.min), rateN = v.rateN ? Number(v.rateN) : 0, rateU = v.rateU in RATE_LBL ? v.rateU : 'day', rate = ratePerDay(rateN, rateU);
      if (!name) throw err('Le nom est obligatoire.');
      if (!Number.isInteger(qty) || qty < 0 || !Number.isInteger(min) || min < 0) throw err('Quantité et seuil : nombres entiers positifs ou nuls.');
      const full = v.full ? Number(v.full) : 0;
      if (!Number.isInteger(full) || full < 0) throw err('Stock de référence invalide.');
      if (!(rateN >= 0)) throw err('Consommation moyenne invalide.');
      const dup = bc && items.find(x => x.barcode && norm(x.barcode) === norm(bc) && x.id !== it.id);
      if (dup) throw err('Ce code-barres existe déjà : « {name} ».', { name: dup.name });
      const now = new Date().toISOString();
      const base = { ...it, id: it.id || uid(), name, cat: v.cat.trim(), unit: v.unit.trim(), min, barcode: bc, exp: v.exp, lot: v.lot.trim(), rate, rateN, rateU, full, notes: v.notes.trim(), created: it.created || now, updated: now };
      if (isNew) { const r = qty > 0 ? applyMove({ ...base, qty: 0 }, 'in', qty, t('Création de la fiche')) : { item: { ...base, qty: 0 } }; await commit(r.item, r.mv); }
      else if (qty !== it.qty) { const r = applyMove({ ...base, qty: it.qty }, 'fix', qty, t('Correction manuelle')); await commit(r.item, r.mv); }
      else await commit({ ...base, qty: it.qty });
    });
  if (!isNew) { const b = document.createElement('button'); b.type = 'button'; b.className = 'ghost danger big'; b.textContent = t('Supprimer cet article');
    b.onclick = async () => { if (!confirm(t('Supprimer « {name} » ? L\'historique est conservé.', { name: it.name }))) return;
      await write(i => i.delete(it.id)); items = items.filter(x => x.id !== it.id); d.close(); render(); };
    d.querySelector('form').insertBefore(b, d.querySelector('.err')); }
}

// ---------- Scanner (zxing-wasm, embarqué : fonctionne hors ligne) ----------
let readBarcodes = null; // zxing-wasm : chargé à la demande, même si index.html est une ancienne version en cache
const loadReader = () => readBarcodes ? Promise.resolve(readBarcodes) : new Promise(ok => {
  const init = () => { if (!window.ZXingWASM) return ok(null);
    ZXingWASM.setZXingModuleOverrides({ locateFile: (p, pre) => p.endsWith('.wasm') ? 'vendor/zxing_reader.wasm' : pre + p }); readBarcodes = ZXingWASM.readBarcodes; ok(readBarcodes); };
  if (window.ZXingWASM) return init();
  const s = document.createElement('script'); s.src = 'vendor/zxing-reader.iife.js'; s.onload = init; s.onerror = () => ok(null); document.head.append(s); });
const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
function grab(src, w, h, max) { const k = Math.min(1, max / Math.max(w, h)); cv.width = Math.round(w * k); cv.height = Math.round(h * k); cx.drawImage(src, 0, 0, cv.width, cv.height); return cx.getImageData(0, 0, cv.width, cv.height); }
function scanner() {
  let stream, done = false, timer;
  const d = modal(t('Scanner un article'), `<video id="cam" playsinline muted></video><p class="small">${t('Pointez la caméra arrière vers le code (code-barres, QR ou Datamatrix) et gardez-la nette.')}</p>
    <label>${t('Ou choisissez une image du code (galerie ou fichiers)')}<input type="file" id="photo" accept="image/*"></label>` + F(t('Saisie manuelle du code'), 'code', '', 'text', 'inputmode="numeric"'),
    async v => { if (!v.code.trim()) throw err('Saisissez un code ou scannez-le.'); found(v.code.trim()); }, 'Valider le code');
  const stop = () => { clearTimeout(timer); stream?.getTracks().forEach(x => x.stop()); };
  const found = raw => { if (done) return; done = true; stop(); d.close();
    const g = parseGS1(raw), code = g ? g.gtin : raw; // Datamatrix GS1 : l'article est reconnu par son GTIN
    const a = items.find(x => x.barcode && norm(x.barcode) === norm(code));
    if (a) qtyDialog(a, 'in'); else itemForm({ barcode: code, ...(g ? { lot: g.lot, exp: g.exp } : {}) }); }; // lot et péremption proposés, à vérifier
  d.addEventListener('close', () => { done = true; stop(); });
  const msg = d.querySelector('.err');
  const fail = (k = 'Caméra indisponible ou autorisation refusée. Utilisez la saisie manuelle.') => { const c = d.querySelector('#cam'); if (c) c.replaceWith(Object.assign(document.createElement('p'), { className: 'small', textContent: t(k) })); };
  d.querySelector('#photo').onchange = async e => { const f = e.target.files[0]; if (!f) return;
    msg.textContent = t('Analyse de la photo…');
    try { const rb = await loadReader(); if (!rb) { msg.textContent = t('Lecteur de codes indisponible. Rechargez la page (une connexion est nécessaire la première fois).'); return; }
      const bmp = await createImageBitmap(f), r = await scanImage(grab(bmp, bmp.width, bmp.height, 2000), rb);
      if (r) found(r); else msg.textContent = t('Aucun code lisible sur cette photo. Rapprochez-vous et réessayez.'); }
    catch { msg.textContent = t('Aucun code lisible sur cette photo. Rapprochez-vous et réessayez.'); } };
  if (!navigator.mediaDevices?.getUserMedia) return fail();
  (async () => { try {
    const rb = await loadReader(); if (!rb) return fail('Lecteur de codes indisponible. Rechargez la page (une connexion est nécessaire la première fois).');
    if (done) return;
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    if (done) return stop();
    const v = d.querySelector('#cam'); v.srcObject = stream; await v.play();
    try { await stream.getVideoTracks()[0].applyConstraints({ advanced: [{ focusMode: 'continuous' }] }); } catch {}
    const tick = async () => { if (done) return;
      try { const r = await scanImage(grab(v, v.videoWidth, v.videoHeight, 1280), rb); if (r) return found(r); } catch {}
      timer = setTimeout(tick, 150); };
    tick();
  } catch { fail(); } })();
}

// ---------- À propos / mentions légales ----------
function about() {
  const d = document.createElement('dialog'), mail = '<a href="mailto:Fabien.beaumier@gmail.com">Fabien.beaumier@gmail.com</a>', P = k => `<p>${t(k)}</p>`;
  d.innerHTML = `<h2>${t('À propos')}</h2>
    ${P("StockDiab est une application permettant de gérer facilement les stocks liés au traitement d'un diabète de type 1 ou 2.")}
    <p>${t("Je développe ce projet seul et je suis ouvert aux suggestions de fonctionnalités. N'hésitez pas à me contacter :")} ${mail}</p>
    <p><b>${t("StockDiab n'est pas un dispositif médical. Pour toute question relative à votre santé, contactez votre médecin.")}</b></p>
    <h3>${t('Mentions légales')}</h3>
    <p>${t('Éditeur : Fabien Beaumier, développeur indépendant. Contact :')} ${mail}</p>
    ${P("Hébergement : GitHub, Inc. (GitHub Pages, github.com). L'hébergeur peut conserver des journaux techniques standard (par exemple l'adresse IP) lors du chargement de l'application.")}
    <h3>${t('Données personnelles')}</h3>
    ${P("Aucune donnée n'est collectée ni transmise à un serveur : vos articles, votre historique et vos ordonnances restent sur cet appareil, sans chiffrement : protégez votre téléphone par un verrouillage d'écran. Aucun compte, aucun suivi, aucune publicité. Seuls la langue et le thème choisis sont mémorisés localement. Le bouton « Buy me a coffee » ouvre un site tiers (PayPal), soumis à ses propres conditions.")}
    <h3>${t('Responsabilité')}</h3>
    ${P("L'application est fournie « en l'état », sans garantie. Vérifiez vous-même vos quantités, lots et dates de péremption : les estimations sont indicatives. L'éditeur n'est pas responsable des pertes de données (exportez régulièrement une sauvegarde) ni des décisions prises à partir de l'application.")}
    <h3>${t('Composants tiers')}</h3>
    ${P("Lecteur de codes : zxing-wasm, basé sur ZXing-C++ (logiciels libres).")}
    <p class="small">© ${new Date().getFullYear()} Fabien Beaumier</p>
    <div class="row"><button class="primary" type="button">${t('Fermer')}</button></div>`;
  document.body.append(d); d.showModal(); d.querySelector('button').onclick = () => d.close(); d.onclose = () => d.remove();
}

// ---------- Ordonnances (photos/PDF stockés localement dans IndexedDB, jamais envoyés) ----------
let docs = [], urls = [], stockTab = 'items';
const toDataURL = b => new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => ko(r.error); r.readAsDataURL(b); });
const fromDataURL = u => fetch(u).then(r => r.blob());
async function shrink(file) { // image -> JPEG réduit (1800 px max) ; PDF conservé tel quel
  if (file.type === 'application/pdf') return file;
  try { const b = await createImageBitmap(file), k = Math.min(1, 1800 / Math.max(b.width, b.height)), c = document.createElement('canvas');
    c.width = Math.round(b.width * k); c.height = Math.round(b.height * k); c.getContext('2d').drawImage(b, 0, 0, c.width, c.height);
    return await new Promise((ok, ko) => c.toBlob(x => x ? ok(x) : ko(), 'image/jpeg', 0.82)); }
  catch { throw err('Impossible de lire cette image.'); }
}
const segBar = () => `<div class="chips" role="group">${[['items', 'Matériel'], ['docs', 'Mes ordonnances']].map(([v, l]) => `<button data-s="${v}" aria-pressed="${stockTab === v}">${t(l)}</button>`).join('')}</div>`;
function docCard(d) {
  const u = d.pages[0].type === 'application/pdf' ? '' : URL.createObjectURL(d.pages[0]); if (u) urls.push(u);
  return `<article class="card"><div class="top"><h3>${esc(d.title)}</h3><span class="tag">${t('{n} page(s)', { n: d.pages.length })}</span></div>
  ${u ? `<img class="thumbimg" src="${u}" alt="">` : ''}${d.date ? `<p class="small">${esc(new Date(d.date + 'T00:00').toLocaleDateString(locale()))}</p>` : ''}${d.note ? `<p class="small">${esc(d.note)}</p>` : ''}
  <div class="row"><button data-a="doc-view" data-id="${d.id}">${t('Voir')}</button><button data-a="doc-edit" data-id="${d.id}">${t('Modifier')}</button><button class="danger" data-a="doc-del" data-id="${d.id}">${t('Supprimer')}</button></div></article>`;
}
function docForm(doc) {
  const isNew = !doc, pages = doc ? [...doc.pages] : []; let tmp = [];
  const d = modal(t(isNew ? 'Scanner une ordonnance' : "Modifier l'ordonnance"),
    F(t('Titre'), 'title', doc?.title || t('Ordonnance'), 'text', 'required maxlength="80"') + F(t("Date de l'ordonnance (facultatif)"), 'date', doc?.date || '', 'date') +
    `<label>${t('Notes')}<textarea name="note" maxlength="500">${esc(doc?.note)}</textarea></label><div id="thumbs" class="thumbs"></div>
     <label>${t("Photographier l'ordonnance")}<input type="file" id="cam" accept="image/*" capture="environment"></label>
     <label>${t('Choisir une image ou un PDF')}<input type="file" id="pick" accept="image/*,application/pdf" multiple></label>`,
    async v => { if (!pages.length) throw err('Ajoutez au moins une page.');
      const now = new Date().toISOString(), rec = { id: doc?.id || uid(), title: v.title.trim() || t('Ordonnance'), date: v.date, note: v.note.trim(), pages: [...pages], created: doc?.created || now, updated: now };
      await write((i, m, dc) => dc.put(rec)); docs = [...docs.filter(x => x.id !== rec.id), rec]; render(); });
  const draw = () => { tmp.forEach(u => URL.revokeObjectURL(u)); tmp = pages.map(p => URL.createObjectURL(p));
    d.querySelector('#thumbs').innerHTML = pages.map((p, i) => `<div class="thumb">${p.type === 'application/pdf' ? '<span>PDF</span>' : `<img src="${tmp[i]}" alt="${esc(t('Page {n}', { n: i + 1 }))}">`}<button type="button" data-rm="${i}" aria-label="${esc(t('Retirer cette page'))}">×</button></div>`).join('');
    d.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { pages.splice(+b.dataset.rm, 1); draw(); }); };
  const add = async e => { const msg = d.querySelector('.err'); msg.textContent = '';
    try { for (const f of e.target.files) pages.push(await shrink(f)); } catch (x) { msg.textContent = em(x); }
    e.target.value = ''; draw(); };
  d.querySelector('#cam').onchange = add; d.querySelector('#pick').onchange = add;
  d.addEventListener('close', () => tmp.forEach(u => URL.revokeObjectURL(u)));
  draw();
}
function docView(doc) {
  if (!doc) return;
  const us = doc.pages.map(p => URL.createObjectURL(p)), d = document.createElement('dialog');
  d.innerHTML = `<h2>${esc(doc.title)}</h2>${doc.note ? `<p>${esc(doc.note)}</p>` : ''}` +
    doc.pages.map((p, i) => p.type === 'application/pdf' ? `<p><a href="${us[i]}" target="_blank" rel="noopener">${t('Ouvrir le PDF')}</a></p>` : `<img class="page" src="${us[i]}" alt="${esc(t('Page {n}', { n: i + 1 }))}">`).join('') +
    `<div class="row"><button class="primary" type="button">${t('Fermer')}</button></div>`;
  document.body.append(d); d.showModal(); d.querySelector('button').onclick = () => d.close();
  d.onclose = () => { us.forEach(u => URL.revokeObjectURL(u)); d.remove(); };
}

// ---------- Alarmes récurrentes : rappels dans l'appli + export calendrier (.ics) pour sonner appli fermée ----------
let alarms = [];
const SUGG = ['Changement de cathéter', "Changement de stylo d'insuline", "Changement de fiole d'insuline", 'Changement de capteur', 'Changement de réservoir'];
const p2 = n => String(n).padStart(2, '0');
const fmtNext = d => d.toLocaleString(locale(), { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const saveAlarm = async a => { await write((i, m, dc, al) => al.put(a)); alarms = [...alarms.filter(x => x.id !== a.id), a]; };
function download(text, name, type) { const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([text], { type })); l.download = name; l.click(); setTimeout(() => URL.revokeObjectURL(l.href), 5000); }
async function checkAlarms() { // appelée toutes les 30 s et au retour dans l'appli : n'affiche que la dernière occurrence manquée de chaque alarme
  const now = new Date(), due = [];
  for (const a of alarms) { if (!a.on) continue; const o = lastOcc(a, now); if (!o || a.fired === o.toISOString()) continue;
    due.push(`${a.label} (${p2(o.getHours())}:${p2(o.getMinutes())})`); await saveAlarm({ ...a, fired: o.toISOString() }); }
  if (!due.length) return;
  if ('Notification' in window && Notification.permission === 'granted') navigator.serviceWorker?.ready.then(r => r.showNotification('StockDiab', { body: due.join('\n'), icon: 'icons/icon-192.png', tag: 'stockdiab-alarm', vibrate: [200, 100, 200] })).catch(() => {});
  navigator.vibrate?.([200, 100, 200]);
  const d = document.createElement('dialog'); d.innerHTML = `<h2>${t('Rappel')}</h2>${due.map(x => `<p><b>${esc(x)}</b></p>`).join('')}<div class="row"><button class="primary" type="button">${t('Fermer')}</button></div>`;
  document.body.append(d); d.showModal(); d.querySelector('button').onclick = () => d.close(); d.onclose = () => d.remove();
}
function alarmForm(a, done) {
  const isNew = !a, n = new Date(), today = `${n.getFullYear()}-${p2(n.getMonth() + 1)}-${p2(n.getDate())}`;
  modal(t(isNew ? 'Nouvelle alarme' : "Modifier l'alarme"),
    `<label>${t('Nom du rappel')}<input name="label" list="sugg" value="${esc(a?.label)}" required maxlength="60"></label><datalist id="sugg">${SUGG.map(x => `<option value="${esc(t(x))}">`).join('')}</datalist>` +
    F(t('Heure'), 'time', a?.time || '08:00', 'time', 'required') + F(t('Répéter tous les (jours)'), 'every', a?.every || 1, 'number', 'min="1" max="365" step="1" inputmode="numeric" required') + F(t('Date de la première alarme'), 'start', a?.start || today, 'date', 'required'),
    async v => { const label = v.label.trim(), every = Number(v.every);
      if (!label) throw err('Le nom est obligatoire.');
      if (!Number.isInteger(every) || every < 1 || every > 365) throw err('La fréquence doit être un nombre entier de jours (1 à 365).');
      if (!/^\d\d:\d\d$/.test(v.time) || !v.start) throw err('Choisissez une date et une heure.');
      const rec = { id: a?.id || uid(), label, time: v.time, every, start: v.start, on: a ? a.on : true };
      rec.fired = lastOcc(rec)?.toISOString() || ''; // seules les prochaines occurrences sonnent
      await saveAlarm(rec);
      if (isNew && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(() => {});
      done(); });
}
function alarmsDialog() {
  const d = document.createElement('dialog');
  const draw = () => { const list = [...alarms].sort((a, b) => nextOcc(a) - nextOcc(b));
    d.innerHTML = `<h2>${t('Mes alarmes')}</h2><p class="small">${t("Les rappels s'affichent quand StockDiab est ouvert. Pour être prévenu application fermée, ajoutez l'alarme au calendrier du téléphone.")}</p>` +
      (list.length ? list.map(a => `<article class="card"><h3>${esc(a.label)}</h3><p class="small">${t('Tous les {n} jour(s) à {h}', { n: a.every, h: a.time })}</p><p class="small">${t('Prochaine : {d}', { d: fmtNext(nextOcc(a)) })}</p>
        <label><input type="checkbox" style="width:auto;min-height:0" data-al="on" data-id="${a.id}" ${a.on ? 'checked' : ''}> ${t('Active')}</label>
        <div class="row"><button type="button" data-al="ics" data-id="${a.id}">${t('Ajouter au calendrier')}</button><button type="button" data-al="edit" data-id="${a.id}">${t('Modifier')}</button><button type="button" class="danger" data-al="del" data-id="${a.id}">${t('Supprimer')}</button></div></article>`).join('')
        : `<p class="small">${t('Aucune alarme. Créez-en une avec le bouton ci-dessous.')}</p>`) +
      `<button type="button" class="primary big" data-al="new">${t('Nouvelle alarme')}</button><div class="row"><button type="button" class="ghost" data-al="close">${t('Fermer')}</button></div>`; };
  d.onclick = async e => { const b = e.target.closest('[data-al]'); if (!b) return; const a = alarms.find(x => x.id === b.dataset.id);
    try { switch (b.dataset.al) {
      case 'close': d.close(); break; case 'new': alarmForm(null, draw); break; case 'edit': alarmForm(a, draw); break;
      case 'ics': download(toICS([a]), 'stockdiab-alarme.ics', 'text/calendar'); break;
      case 'del': if (confirm(t("Supprimer l'alarme « {name} » ?", { name: a.label }))) { await write((i, m, dc, al) => al.delete(a.id)); alarms = alarms.filter(x => x.id !== a.id); draw(); } break; } }
    catch (x) { alert(em(x)); } };
  d.onchange = async e => { const b = e.target.closest('[data-al=on]'); if (!b) return; const a = alarms.find(x => x.id === b.dataset.id);
    await saveAlarm({ ...a, on: b.checked, fired: lastOcc(a)?.toISOString() || '' }); draw(); };
  draw(); document.body.append(d); d.showModal(); d.onclose = () => d.remove();
}

// ---------- Vues ----------
function bar(a) { // barre : quantité restante / stock de référence
  const p = pct(a, moves), r = refQty(a, moves);
  return `<div class="bar ${status(a)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="${esc(t('{p} % du stock de référence ({r})', { p, r }))}"><span style="width:${p}%"></span></div><p class="small">${esc(t('{p} % du stock de référence ({r})', { p, r }))}</p>`;
}
function card(a) {
  const s = status(a), e = expiry(a), j = daysLeft(a);
  return `<article class="card ${s}"><div class="top"><h3>${esc(a.name)}</h3><span class="tag ${s}">${t(LBL[s])}</span></div>
  <p class="qty">${plural(a.qty, a.unit)}</p>${bar(a)}<p class="small">${esc(a.cat)}${a.cat ? ' · ' : ''}${t("seuil d'alerte : {n}", { n: a.min })}${a.barcode ? ' · ' + t('code {c}', { c: esc(a.barcode) }) : ''}</p>
  ${a.exp ? `<p class="small">${t('Péremption : {d}', { d: esc(a.exp) })}${e === 'expired' ? t(' — PÉRIMÉ') : e === 'soon' ? t(' — bientôt périmé (moins de 30 jours)') : ''}${a.lot ? ' · ' + t('lot {l}', { l: esc(a.lot) }) : ''}</p>` : a.lot ? `<p class="small">${t('lot {l}', { l: esc(a.lot) })}</p>` : ''}
  ${j !== null ? `<p class="small">${t('Estimation indicative : environ {n} jour(s) de stock', { n: j })}</p>` : ''}${a.notes ? `<p class="small">${esc(a.notes)}</p>` : ''}
  <div class="row"><button data-a="q1" data-id="${a.id}" ${a.qty < 1 ? 'disabled' : ''}>${t('Retirer 1')}</button><button data-a="out" data-id="${a.id}">${t('Retirer…')}</button><button data-a="in" data-id="${a.id}">${t('Ajouter')}</button><button data-a="edit" data-id="${a.id}">${t('Fiche')}</button></div></article>`;
}
const byName = (a, b) => a.name.localeCompare(b.name, 'fr');
function render() {
  urls.forEach(u => URL.revokeObjectURL(u)); urls = [];
  document.querySelectorAll('nav button').forEach(b => { b.textContent = t(NAV[b.dataset.v]); b.setAttribute('aria-current', b.dataset.v === view ? 'page' : 'false'); });
  const m = $('#main');
  if (view === 'home') {
    const low = items.filter(a => status(a) !== 'ok').sort(byName), ex = items.filter(a => expiry(a));
    m.innerHTML = `<div><button class="ghost" data-a="alarms">${t('Mes alarmes')}</button></div><div class="stats"><div><b>${items.length}</b>${t('références')}</div><div><b>${items.filter(a => status(a) === 'low').length}</b>${t('sous le seuil')}</div><div><b>${items.filter(a => a.qty <= 0).length}</b>${t('épuisés')}</div></div>
    <h2>${t('À racheter')}</h2>${low.length ? low.map(card).join('') : `<p class="small">${t('Aucun article à réapprovisionner.')}</p>`}
    ${ex.length ? `<h2>${t('Péremption')}</h2>${ex.map(card).join('')}` : ''}
    `;
  } else if (view === 'stock' && stockTab === 'docs') {
    const list = [...docs].sort((a, b) => (b.date || b.created).localeCompare(a.date || a.created));
    m.innerHTML = `${segBar()}<button class="primary big" data-a="doc-new">${t('Scanner une ordonnance')}</button>` + (list.length ? list.map(docCard).join('') : `<p class="small">${t('Aucune ordonnance enregistrée. Scannez-en une avec le bouton ci-dessus.')}</p>`);
  } else if (view === 'stock') {
    const k = q.toLowerCase();
    const list = items.filter(a => (!k || [a.name, a.cat, a.barcode].some(x => (x || '').toLowerCase().includes(k))) &&
      (flt === 'all' || (flt === 'low' && status(a) === 'low') || (flt === 'out' && a.qty <= 0) || (flt === 'exp' && expiry(a)))).sort(byName);
    m.innerHTML = `${segBar()}<label>${t('Rechercher (nom, catégorie, code-barres)')}<input id="q" type="search" value="${esc(q)}"></label>
    <div class="chips">${[['all','Tous'],['low','Stock faible'],['out','Épuisés'],['exp','Péremption proche']].map(([v, l]) => `<button data-f="${v}" aria-pressed="${flt === v}">${t(l)}</button>`).join('')}</div>
    ${list.length ? list.map(card).join('') : `<p class="small">${t('Aucun article.')}</p>`}`;
    const qi = $('#q'); qi.oninput = () => { q = qi.value; const p = qi.selectionStart; render(); const n = $('#q'); n.focus(); n.setSelectionRange(p, p); };
  } else if (view === 'add') {
    m.innerHTML = `<button class="primary big" data-a="scan">${t('Scanner un article')}</button><button class="ghost big" data-a="new">${t('Créer une fiche manuellement')}</button>
    <p class="small">${t("Le code-barres sert uniquement à reconnaître l'article. Quantité, lot et péremption restent à saisir et à vérifier vous-même.")}</p>`;
  } else if (view === 'hist') {
    const names = [...new Map(moves.map(x => [x.itemId, x.name]))];
    const list = moves.filter(x => (!hItem || x.itemId === hItem) && (!hType || x.type === hType)).sort((a, b) => b.at.localeCompare(a.at));
    m.innerHTML = `<label>${t('Article')}<select id="hi"><option value="">${t('Tous')}</option>${names.map(([id, n]) => `<option value="${esc(id)}" ${id === hItem ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
    <label>${t('Type')}<select id="ht"><option value="">${t('Tous')}</option>${Object.entries(TYPE).map(([k, v]) => `<option value="${k}" ${k === hType ? 'selected' : ''}>${t(v)}</option>`).join('')}</select></label>
    ${moves.length ? `<button class="ghost danger big" data-a="clear-hist">${t("Effacer l'historique")}</button>` : ''}
    ${list.length ? list.map(x => `<article class="card"><div class="top"><h3>${esc(x.name)}</h3><span class="tag">${t(TYPE[x.type])}</span></div><p class="small">${x.type === 'fix' ? t('Correction') : (x.type === 'in' ? '+' : '−') + x.qty} · ${x.before} → ${x.after} · ${new Date(x.at).toLocaleString(locale())}${x.note ? ' · ' + esc(x.note) : ''}</p></article>`).join('') : `<p class="small">${t('Aucun mouvement.')}</p>`}`;
    $('#hi').onchange = e => { hItem = e.target.value; render(); }; $('#ht').onchange = e => { hType = e.target.value; render(); };  } else {
    m.innerHTML = `<h2>${t('Langue')}</h2><select id="lang" aria-label="${t('Langue')}">${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${k === getLang() ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <h2>${t('Thème')}</h2><select id="theme" aria-label="${t('Thème')}">${[['', 'Automatique (système)'], ['light', 'Clair'], ['dark', 'Sombre']].map(([k, l]) => `<option value="${k}" ${k === getTheme() ? 'selected' : ''}>${t(l)}</option>`).join('')}</select>
    <h2>${t('Sauvegarde')}</h2><p class="small">${t("Les données sont stockées uniquement sur ce téléphone. Vider les données du navigateur, désinstaller l'application ou perdre le téléphone les efface. Exportez une sauvegarde régulièrement.")}</p><p class="small">${t("L'export contient aussi vos ordonnances : conservez le fichier en lieu sûr.")}</p>
    <div class="row"><button class="primary" data-a="export">${t('Exporter (JSON)')}</button><button class="ghost" data-a="import">${t('Restaurer…')}</button></div><button class="ghost danger big" data-a="wipe">${t('Effacer toutes les données')}</button>
    <input type="file" id="file" accept="application/json,.json" hidden>
    <button class="ghost big" data-a="about">${t('À propos')}</button>
    <h2>${t('Soutenir le projet')}</h2><a class="primary big" href="https://paypal.me/FabienBeaumier" target="_blank" rel="noopener noreferrer">Buy me a coffee</a>`;
    $('#lang').onchange = e => { setLang(e.target.value); render(); };
    $('#theme').onchange = e => setTheme(e.target.value);
  }
}

// ---------- Actions ----------
document.addEventListener('click', async e => {
  const nav = e.target.closest('nav button'); if (nav) { view = nav.dataset.v; return render(); }
  const sg = e.target.closest('[data-s]'); if (sg) { stockTab = sg.dataset.s; return render(); }
  const f = e.target.closest('[data-f]'); if (f) { flt = f.dataset.f; return render(); }
  const b = e.target.closest('[data-a]'); if (!b || busy) return;
  const a = items.find(x => x.id === b.dataset.id);
  try {
    switch (b.dataset.a) {
      case 'q1': if (confirm(t('Retirer 1 {u} de « {name} » ?', { u: a.unit, name: a.name }))) { busy = true; try { await move(a, 'out', 1, t('Retrait rapide')); } finally { busy = false; } } break;
      case 'out': case 'in': qtyDialog(a, b.dataset.a); break;
      case 'edit': itemForm(a); break;
      case 'scan': scanner(); break;
      case 'about': about(); break;
      case 'alarms': alarmsDialog(); break;
      case 'doc-new': docForm(); break;
      case 'doc-view': docView(docs.find(x => x.id === b.dataset.id)); break;
      case 'doc-edit': docForm(docs.find(x => x.id === b.dataset.id)); break;
      case 'doc-del': { const dd = docs.find(x => x.id === b.dataset.id);
        if (dd && confirm(t("Supprimer l'ordonnance « {title} » ?", { title: dd.title }))) { await write((i, m, dc) => dc.delete(dd.id)); docs = docs.filter(x => x.id !== dd.id); render(); } break; }
      case 'new': itemForm(); break;
      case 'export': { const blob = new Blob([JSON.stringify({ app: 'stockdiab', version: 3, exported: new Date().toISOString(), items, moves, alarms, docs: await Promise.all(docs.map(async d => ({ ...d, pages: await Promise.all(d.pages.map(toDataURL)) }))) }, null, 1)], { type: 'application/json' });
        const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = `stockdiab-${new Date().toISOString().slice(0, 10)}.json`; l.click(); setTimeout(() => URL.revokeObjectURL(l.href), 5000); break; }
      case 'import': { const fi = $('#file'); fi.onchange = async () => { try { const o = validateBackup(JSON.parse(await fi.files[0].text()));
          if (!confirm(t('Remplacer toutes les données actuelles par cette sauvegarde ({a} articles, {m} mouvements, {d} ordonnances) ?', { a: o.items.length, m: o.moves.length, d: (o.docs || []).length }))) return;
          await replaceAll(o.items, o.moves, await Promise.all((o.docs || []).map(async d => ({ ...d, pages: await Promise.all(d.pages.map(fromDataURL)) }))), o.alarms || []); } catch (x) { alert(x instanceof SyntaxError ? t('Sauvegarde invalide : fichier illisible.') : em(x)); } }; fi.click(); break; }
      case 'clear-hist': if (confirm(t("Effacer tout l'historique des mouvements ? Les articles et les quantités sont conservés. Action irréversible."))) {
        await write((i, m) => m.clear()); moves = []; hItem = ''; hType = ''; render(); } break;
      case 'wipe': if (confirm(t('Effacer TOUTES les données (articles, historique et ordonnances) ? Action irréversible.'))) await replaceAll([], []); break;
    }
  } catch (x) { alert(em(x)); }
});
async function replaceAll(its, mvs, dcs = [], als = []) {
  await write((i, m, dc, al) => { i.clear(); m.clear(); dc.clear(); al.clear(); its.forEach(x => i.put(x)); mvs.forEach(x => m.put(x)); dcs.forEach(x => dc.put(x)); als.forEach(x => al.put(x)); }); items = its; moves = mvs; docs = dcs; alarms = als; render();
}

// ---------- Démarrage ----------
(async () => {
  $('nav').innerHTML = Object.keys(NAV).map(k => `<button data-v="${k}"></button>`).join('');
  try { db = await open(); items = await getAll('items'); moves = await getAll('moves'); docs = await getAll('docs'); alarms = await getAll('alarms'); }
  catch { $('#main').innerHTML = `<p class="err">${t("Stockage local indisponible (navigation privée ?). L'application ne peut pas enregistrer de données.")}</p>`; return; }
  render();
  checkAlarms(); setInterval(checkAlarms, 30000); document.addEventListener('visibilitychange', () => { if (!document.hidden) checkAlarms(); });
  if ('serviceWorker' in navigator) { const had = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !reloaded) { reloaded = true; location.reload(); } }); } // nouvelle version : rechargement unique
  navigator.storage?.persist?.(); // demande de stockage persistant (évite l'éviction automatique)
})();
