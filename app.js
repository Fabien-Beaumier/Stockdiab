import { esc, status, expiry, daysLeft, applyMove, validateBackup, uid, err, norm, parseGS1, refQty, pct } from './logic.js';
import './install.js';
import { t, LANGS, getLang, setLang, locale } from './i18n.js';
const getTheme = () => { try { return localStorage.getItem('sd-theme') || ''; } catch { return ''; } };
const setTheme = v => { const r = document.documentElement; v ? r.dataset.theme = v : delete r.dataset.theme; try { v ? localStorage.setItem('sd-theme', v) : localStorage.removeItem('sd-theme'); } catch {} };
const em = x => t(x.tpl || x.message, x.vars); // message d'erreur traduit
const $ = s => document.querySelector(s);
const LBL = { ok: 'Stock suffisant', low: 'Stock faible', out: 'Épuisé' };
const TYPE = { in: 'Entrée', out: 'Sortie', fix: 'Correction' };
const NAV = { home: 'Accueil', stock: 'Mon stock', add: 'Ajouter', hist: 'Historique' };
const UNITS = ['pièce','boîte','stylo','fiole','cartouche','cathéter','réservoir','capteur','pile','bandelette'];
let db, items = [], moves = [], view = 'home', flt = 'all', q = '', hItem = '', hType = '', busy = false;

// ---------- Stockage IndexedDB ----------
const open = () => new Promise((ok, ko) => { const r = indexedDB.open('stockdiab', 1);
  r.onupgradeneeded = () => { r.result.createObjectStore('items', { keyPath: 'id' }); r.result.createObjectStore('moves', { keyPath: 'id' }); };
  r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
const getAll = s => new Promise((ok, ko) => { const r = db.transaction(s).objectStore(s).getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
const write = fn => new Promise((ok, ko) => { const t = db.transaction(['items', 'moves'], 'readwrite'); fn(t.objectStore('items'), t.objectStore('moves')); t.oncomplete = ok; t.onerror = t.onabort = () => ko(err('Erreur de stockage local.')); });
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
function itemForm(it = {}) {
  const isNew = !it.id;
  const d = modal(t(isNew ? 'Nouvel article' : "Modifier l'article"),
    F(t('Nom du produit'), 'name', it.name, 'text', 'required maxlength="80"') + F(t('Catégorie'), 'cat', it.cat, 'text', 'maxlength="40"') +
    `<label>${t('Unité de comptage')}<input name="unit" list="units" value="${esc(it.unit || t('pièce'))}" required maxlength="20"></label><datalist id="units">${UNITS.map(u => `<option>${esc(t(u))}`).join('')}</datalist>` +
    F(t(isNew ? 'Quantité initiale' : 'Quantité (toute modification est enregistrée comme correction)'), 'qty', it.qty ?? 0, 'number', 'min="0" step="1" required') +
    F(t("Seuil d'alerte (alerte si stock ≤ seuil)"), 'min', it.min ?? 1, 'number', 'min="0" step="1" required') +
    F(t('Code-barres (facultatif)'), 'barcode', it.barcode, 'text', 'inputmode="numeric" maxlength="40"') + F(t('Date de péremption (facultatif)'), 'exp', it.exp, 'date') +
    F(t('Numéro de lot (facultatif)'), 'lot', it.lot) + F(t('Stock de référence = 100 % de la barre (facultatif)'), 'full', it.full || '', 'number', 'min="1" step="1"') + F(t('Consommation moyenne par jour (facultatif, estimation)'), 'rate', it.rate || '', 'number', 'min="0" step="any"') +
    `<label>${t('Notes')}<textarea name="notes" maxlength="500">${esc(it.notes)}</textarea></label>`,
    async v => {
      const name = v.name.trim(), bc = v.barcode.trim(), qty = Number(v.qty), min = Number(v.min), rate = v.rate ? Number(v.rate) : 0;
      if (!name) throw err('Le nom est obligatoire.');
      if (!Number.isInteger(qty) || qty < 0 || !Number.isInteger(min) || min < 0) throw err('Quantité et seuil : nombres entiers positifs ou nuls.');
      const full = v.full ? Number(v.full) : 0;
      if (!Number.isInteger(full) || full < 0) throw err('Stock de référence invalide.');
      if (!(rate >= 0)) throw err('Consommation moyenne invalide.');
      const dup = bc && items.find(x => x.barcode && norm(x.barcode) === norm(bc) && x.id !== it.id);
      if (dup) throw err('Ce code-barres existe déjà : « {name} ».', { name: dup.name });
      const now = new Date().toISOString();
      const base = { ...it, id: it.id || uid(), name, cat: v.cat.trim(), unit: v.unit.trim(), min, barcode: bc, exp: v.exp, lot: v.lot.trim(), rate, full, notes: v.notes.trim(), created: it.created || now, updated: now };
      if (isNew) { const r = qty > 0 ? applyMove({ ...base, qty: 0 }, 'in', qty, t('Création de la fiche')) : { item: { ...base, qty: 0 } }; await commit(r.item, r.mv); }
      else if (qty !== it.qty) { const r = applyMove({ ...base, qty: it.qty }, 'fix', qty, t('Correction manuelle')); await commit(r.item, r.mv); }
      else await commit({ ...base, qty: it.qty });
    });
  if (!isNew) { const b = document.createElement('button'); b.type = 'button'; b.className = 'ghost danger big'; b.textContent = t('Supprimer cet article');
    b.onclick = async () => { if (!confirm(t('Supprimer « {name} » ? L\'historique est conservé.', { name: it.name }))) return;
      await write(i => i.delete(it.id)); items = items.filter(x => x.id !== it.id); d.close(); render(); };
    d.querySelector('form').insertBefore(b, d.querySelector('.err')); }
}

// ---------- Scanner ----------
function scanner() {
  let sc, done = false;
  const d = modal(t('Scanner un article'), `<div id="reader"></div><p class="small">${t('Pointez la caméra arrière vers le code-barres (1D, QR ou Datamatrix), ou saisissez-le à la main.')}</p>` + F(t('Saisie manuelle du code'), 'code', '', 'text', 'inputmode="numeric"'),
    async v => { if (!v.code.trim()) throw err('Saisissez un code ou scannez-le.'); found(v.code.trim()); }, 'Valider le code');
  const stop = () => sc && sc.isScanning ? sc.stop().catch(() => {}) : 0;
  const found = raw => { if (done) return; done = true; stop(); d.close();
    const g = parseGS1(raw), code = g ? g.gtin : raw; // Datamatrix GS1 : on reconnaît l'article par son GTIN
    const a = items.find(x => x.barcode && norm(x.barcode) === norm(code));
    if (a) qtyDialog(a, 'in'); else itemForm({ barcode: code, ...(g ? { lot: g.lot, exp: g.exp } : {}) }); }; // lot/péremption proposés, à vérifier
  d.addEventListener('close', stop);
  if (!window.Html5Qrcode) return;
  const Fm = Html5QrcodeSupportedFormats;
  sc = new Html5Qrcode('reader', { formatsToSupport: [Fm.DATA_MATRIX, Fm.QR_CODE, Fm.EAN_13, Fm.EAN_8, Fm.UPC_A, Fm.UPC_E, Fm.CODE_128, Fm.CODE_39, Fm.ITF] });
  sc.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } }, found, () => {})
    .catch(() => { d.querySelector('#reader').outerHTML = `<p class="small">${t('Caméra indisponible ou autorisation refusée. Utilisez la saisie manuelle.')}</p>`; });
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
  document.querySelectorAll('nav button').forEach(b => { b.textContent = t(NAV[b.dataset.v]); b.setAttribute('aria-current', b.dataset.v === view ? 'page' : 'false'); });
  const m = $('#main');
  if (view === 'home') {
    const low = items.filter(a => status(a) !== 'ok').sort(byName), ex = items.filter(a => expiry(a));
    m.innerHTML = `<div class="stats"><div><b>${items.length}</b>${t('références')}</div><div><b>${items.filter(a => status(a) === 'low').length}</b>${t('sous le seuil')}</div><div><b>${items.filter(a => a.qty <= 0).length}</b>${t('épuisés')}</div></div>
    <h2>${t('À racheter')}</h2>${low.length ? low.map(card).join('') : `<p class="small">${t('Aucun article à réapprovisionner.')}</p>`}
    ${ex.length ? `<h2>${t('Péremption')}</h2>${ex.map(card).join('')}` : ''}
    <h2>${t('Sauvegarde')}</h2><p class="small">${t("Les données sont stockées uniquement sur ce téléphone. Vider les données du navigateur, désinstaller l'application ou perdre le téléphone les efface. Exportez une sauvegarde régulièrement.")}</p>
    <div class="row"><button class="primary" data-a="export">${t('Exporter (JSON)')}</button><button class="ghost" data-a="import">${t('Restaurer…')}</button></div><button class="ghost danger big" data-a="wipe">${t('Effacer toutes les données')}</button>
    <h2>${t('Langue')}</h2><select id="lang" aria-label="${t('Langue')}">${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${k === getLang() ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <h2>${t('Thème')}</h2><select id="theme" aria-label="${t('Thème')}">${[['', 'Automatique (système)'], ['light', 'Clair'], ['dark', 'Sombre']].map(([k, l]) => `<option value="${k}" ${k === getTheme() ? 'selected' : ''}>${t(l)}</option>`).join('')}</select>
    <input type="file" id="file" accept="application/json,.json" hidden>`;
    $('#lang').onchange = e => { setLang(e.target.value); render(); };
    $('#theme').onchange = e => setTheme(e.target.value);
  } else if (view === 'stock') {
    const k = q.toLowerCase();
    const list = items.filter(a => (!k || [a.name, a.cat, a.barcode].some(x => (x || '').toLowerCase().includes(k))) &&
      (flt === 'all' || (flt === 'low' && status(a) === 'low') || (flt === 'out' && a.qty <= 0) || (flt === 'exp' && expiry(a)))).sort(byName);
    m.innerHTML = `<label>${t('Rechercher (nom, catégorie, code-barres)')}<input id="q" type="search" value="${esc(q)}"></label>
    <div class="chips">${[['all','Tous'],['low','Stock faible'],['out','Épuisés'],['exp','Péremption proche']].map(([v, l]) => `<button data-f="${v}" aria-pressed="${flt === v}">${t(l)}</button>`).join('')}</div>
    ${list.length ? list.map(card).join('') : `<p class="small">${t('Aucun article.')}</p>`}`;
    const qi = $('#q'); qi.oninput = () => { q = qi.value; const p = qi.selectionStart; render(); const n = $('#q'); n.focus(); n.setSelectionRange(p, p); };
  } else if (view === 'add') {
    m.innerHTML = `<button class="primary big" data-a="scan">${t('Scanner un article')}</button><button class="ghost big" data-a="new">${t('Créer une fiche manuellement')}</button>
    <p class="small">${t("Le code-barres sert uniquement à reconnaître l'article. Quantité, lot et péremption restent à saisir et à vérifier vous-même.")}</p>`;
  } else {
    const names = [...new Map(moves.map(x => [x.itemId, x.name]))];
    const list = moves.filter(x => (!hItem || x.itemId === hItem) && (!hType || x.type === hType)).sort((a, b) => b.at.localeCompare(a.at));
    m.innerHTML = `<label>${t('Article')}<select id="hi"><option value="">${t('Tous')}</option>${names.map(([id, n]) => `<option value="${esc(id)}" ${id === hItem ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>
    <label>${t('Type')}<select id="ht"><option value="">${t('Tous')}</option>${Object.entries(TYPE).map(([k, v]) => `<option value="${k}" ${k === hType ? 'selected' : ''}>${t(v)}</option>`).join('')}</select></label>
    ${list.length ? list.map(x => `<article class="card"><div class="top"><h3>${esc(x.name)}</h3><span class="tag">${t(TYPE[x.type])}</span></div><p class="small">${x.type === 'fix' ? t('Correction') : (x.type === 'in' ? '+' : '−') + x.qty} · ${x.before} → ${x.after} · ${new Date(x.at).toLocaleString(locale())}${x.note ? ' · ' + esc(x.note) : ''}</p></article>`).join('') : `<p class="small">${t('Aucun mouvement.')}</p>`}`;
    $('#hi').onchange = e => { hItem = e.target.value; render(); }; $('#ht').onchange = e => { hType = e.target.value; render(); };
  }
}

// ---------- Actions ----------
document.addEventListener('click', async e => {
  const nav = e.target.closest('nav button'); if (nav) { view = nav.dataset.v; return render(); }
  const f = e.target.closest('[data-f]'); if (f) { flt = f.dataset.f; return render(); }
  const b = e.target.closest('[data-a]'); if (!b || busy) return;
  const a = items.find(x => x.id === b.dataset.id);
  try {
    switch (b.dataset.a) {
      case 'q1': if (confirm(t('Retirer 1 {u} de « {name} » ?', { u: a.unit, name: a.name }))) { busy = true; try { await move(a, 'out', 1, t('Retrait rapide')); } finally { busy = false; } } break;
      case 'out': case 'in': qtyDialog(a, b.dataset.a); break;
      case 'edit': itemForm(a); break;
      case 'scan': scanner(); break;
      case 'new': itemForm(); break;
      case 'export': { const blob = new Blob([JSON.stringify({ app: 'stockdiab', version: 1, exported: new Date().toISOString(), items, moves }, null, 1)], { type: 'application/json' });
        const l = document.createElement('a'); l.href = URL.createObjectURL(blob); l.download = `stockdiab-${new Date().toISOString().slice(0, 10)}.json`; l.click(); setTimeout(() => URL.revokeObjectURL(l.href), 5000); break; }
      case 'import': { const fi = $('#file'); fi.onchange = async () => { try { const o = validateBackup(JSON.parse(await fi.files[0].text()));
          if (!confirm(t('Remplacer toutes les données actuelles par cette sauvegarde ({a} articles, {m} mouvements) ?', { a: o.items.length, m: o.moves.length }))) return;
          await replaceAll(o.items, o.moves); } catch (x) { alert(x instanceof SyntaxError ? t('Sauvegarde invalide : fichier illisible.') : em(x)); } }; fi.click(); break; }
      case 'wipe': if (confirm(t('Effacer TOUTES les données (articles et historique) ? Action irréversible.'))) await replaceAll([], []); break;
    }
  } catch (x) { alert(em(x)); }
});
async function replaceAll(its, mvs) {
  await write((i, m) => { i.clear(); m.clear(); its.forEach(x => i.put(x)); mvs.forEach(x => m.put(x)); }); items = its; moves = mvs; render();
}

// ---------- Démarrage ----------
(async () => {
  try { db = await open(); items = await getAll('items'); moves = await getAll('moves'); }
  catch { $('#main').innerHTML = `<p class="err">${t("Stockage local indisponible (navigation privée ?). L'application ne peut pas enregistrer de données.")}</p>`; return; }
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.storage?.persist?.(); // demande de stockage persistant (évite l'éviction automatique)
})();
