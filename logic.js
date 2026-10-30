// Logique pure (sans DOM) : testable avec Node.
const fill = (s, v = {}) => s.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
// Erreur traduisible : tpl = clé française, vars = valeurs.
export const err = (tpl, vars) => Object.assign(new Error(fill(tpl, vars)), { tpl, vars });
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const status = a => a.qty <= 0 ? 'out' : a.qty <= a.min ? 'low' : 'ok';
export const expiry = (a, now = Date.now()) => {
  if (!a.exp) return null;
  const d = (new Date(a.exp + 'T23:59:59') - now) / 864e5;
  return d < 0 ? 'expired' : d <= 30 ? 'soon' : null;
};
export const refQty = (a, moves = []) => a.full > 0 ? a.full : Math.max(a.qty, ...moves.filter(m => m.itemId === a.id).map(m => m.after));
export const pct = (a, moves) => { const r = refQty(a, moves); return r > 0 ? Math.min(100, Math.round(a.qty / r * 100)) : 0; };
export const daysLeft = a => a.rate > 0 ? Math.floor(a.qty / a.rate) : null;
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));

// type: 'in' | 'out' | 'fix'. Pour 'fix', n = nouvelle quantité totale.
export function applyMove(item, type, n, note = '', now = new Date()) {
  n = Number(n);
  if (!Number.isInteger(n) || n < 0 || (type !== 'fix' && n < 1)) throw err('Quantité invalide : entrez un nombre entier.');
  const before = item.qty;
  let after;
  if (type === 'in') after = before + n;
  else if (type === 'out') {
    if (n > before) throw err('Retrait impossible : il reste {n} en stock.', { n: before });
    after = before - n;
  } else if (type === 'fix') after = n;
  else throw err('Type de mouvement inconnu.');
  const at = now.toISOString();
  return {
    item: { ...item, qty: after, updated: at },
    mv: { id: uid(), itemId: item.id, name: item.name, type, qty: Math.abs(after - before), before, after, at, note: note || '' }
  };
}

export function validateBackup(o) {
  const bad = (m, v) => { throw err('Sauvegarde invalide : ' + m, v); };
  if (!o || typeof o !== 'object' || o.app !== 'stockdiab') bad('ce fichier n\'est pas une sauvegarde StockDiab.');
  if (!Array.isArray(o.items) || !Array.isArray(o.moves)) bad('données manquantes.');
  for (const a of o.items) {
    if (typeof a.id !== 'string' || typeof a.name !== 'string' || !a.name.trim()) bad('article mal formé.');
    if (!Number.isInteger(a.qty) || a.qty < 0 || !Number.isInteger(a.min) || a.min < 0) bad('quantités invalides pour « {name} ».', { name: a.name });
  }
  for (const m of o.moves) {
    if (typeof m.id !== 'string' || !['in', 'out', 'fix'].includes(m.type) || !Number.isInteger(m.before) || !Number.isInteger(m.after)) bad('mouvement mal formé.');
  }
  if (o.docs !== undefined) {
    if (!Array.isArray(o.docs)) bad('données manquantes.');
    for (const d of o.docs) if (typeof d.id !== 'string' || !Array.isArray(d.pages) || !d.pages.length ||
      d.pages.some(p => typeof p !== 'string' || !/^data:(image\/(jpeg|png|webp|gif)|application\/pdf);base64,/.test(p))) bad('ordonnance mal formée.');
  }
  if (o.alarms !== undefined) {
    if (!Array.isArray(o.alarms)) bad('données manquantes.');
    for (const a of o.alarms) if (typeof a.id !== 'string' || typeof a.label !== 'string' || !/^\d\d:\d\d$/.test(a.time) || !Number.isInteger(a.every) || a.every < 1 || a.every > 365 || !/^\d{4}-\d\d-\d\d$/.test(a.start)) bad('alarme mal formée.');
  }
  return o;
}

// Compare des codes numériques sans tenir compte des zéros de tête (EAN-13 vs GTIN-14).
export const norm = c => /^\d+$/.test(c) ? c.replace(/^0+/, '') : c;

// Lecture GS1 (Datamatrix des dispositifs médicaux) : GTIN (01), lot (10), péremption (17).
// Renvoie null si le contenu n'est pas du GS1 ; sinon { gtin, lot, exp }. Valeurs à vérifier par l'utilisateur.
const FIX = { '01': 14, '11': 6, '15': 6, '17': 6 }, VAR = ['10', '21'], GS = '\x1d';
export function parseGS1(raw) {
  let s = String(raw).trim().replace(/^\]d2/i, '').replace(/\((\d{2})\)/g, GS + '$1').replace(/^\x1d/, '');
  if (!/^01\d{14}/.test(s)) return null;
  const o = {};
  while (s) {
    const ai = s.slice(0, 2);
    if (s[0] === GS) s = s.slice(1);
    else if (FIX[ai]) { o[ai] = s.slice(2, 2 + FIX[ai]); s = s.slice(2 + FIX[ai]); }
    else if (VAR.includes(ai)) { const i = s.indexOf(GS); o[ai] = i < 0 ? s.slice(2) : s.slice(2, i); s = i < 0 ? '' : s.slice(i); }
    else break; // AI inconnu : on garde ce qui est déjà lu
  }
  if (!/^\d{14}$/.test(o['01'] || '')) return null;
  let exp = '';
  if (/^\d{6}$/.test(o['17'] || '')) {
    const y = 2000 + +o['17'].slice(0, 2), m = +o['17'].slice(2, 4), d = +o['17'].slice(4) || new Date(y, m, 0).getDate();
    if (m >= 1 && m <= 12) exp = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return { gtin: o['01'], lot: o['10'] || '', exp };
}

// ---- Alarmes récurrentes : une occurrence tous les `every` jours, à l'heure `time`, à partir de `start` (heure locale).
export const occAt = (a, k) => { const [y, m, d] = a.start.split('-').map(Number), [h, mi] = a.time.split(':').map(Number); return new Date(y, m - 1, d + k * a.every, h, mi); };
export function lastOcc(a, now = new Date()) { // dernière occurrence passée (null si pas encore commencée)
  let k = Math.floor((now - occAt(a, 0)) / (a.every * 864e5)); if (k < 0) return null;
  while (occAt(a, k + 1) <= now) k++; while (k >= 0 && occAt(a, k) > now) k--;
  return k < 0 ? null : occAt(a, k);
}
export function nextOcc(a, now = new Date()) { // prochaine occurrence strictement future
  let k = Math.max(0, Math.floor((now - occAt(a, 0)) / (a.every * 864e5)) - 1); while (occAt(a, k) <= now) k++; return occAt(a, k);
}
// Fichier .ics (calendrier du téléphone) : événement récurrent avec rappel à l'heure exacte, qui sonne même appli fermée.
export function toICS(list, now = new Date()) {
  const p = n => String(n).padStart(2, '0'), loc = d => `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
  const x = s => String(s).replace(/[\\;,]/g, c => '\\' + c).replace(/\r?\n/g, '\\n');
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//StockDiab//FR', 'CALSCALE:GREGORIAN'];
  for (const a of list) { const s = occAt(a, 0);
    L.push('BEGIN:VEVENT', `UID:${a.id}@stockdiab`, `DTSTAMP:${stamp}`, `DTSTART:${loc(s)}`, `DTEND:${loc(new Date(+s + 15 * 6e4))}`, `RRULE:FREQ=DAILY;INTERVAL=${a.every}`, `SUMMARY:${x(a.label)}`,
      'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', `DESCRIPTION:${x(a.label)}`, 'END:VALARM', 'END:VEVENT'); }
  L.push('END:VCALENDAR'); return L.join('\r\n') + '\r\n';
}
