// Décodage d'une image caméra avec zxing-wasm (injecté : readBarcodes).
// 1) essai direct ; 2) versions réduites et légèrement floutées : les Datamatrix pointillés
//    (gravés au laser sur les boîtes de médicaments) se lisent mal tels quels, le flou fusionne les points.
const OPTS = { formats: ['DataMatrix', 'QRCode', 'EAN-13', 'EAN-8', 'UPC-A', 'UPC-E', 'Code128', 'Code39', 'ITF'],
  tryHarder: true, tryRotate: true, tryInvert: true, tryDownscale: true, maxNumberOfSymbols: 1, textMode: 'HRI' };
const VARIANTS = [[2, 0], [3, 1], [4, 0], [4, 1], [6, 0], [6, 1], [8, 0], [3, 0], [2, 1]]; // [facteur de réduction, rayon de flou]

function gray(img) { const { data, width: w, height: h } = img, g = new Uint8ClampedArray(w * h);
  for (let i = 0, j = 0; i < g.length; i++, j += 4) g[i] = (data[j] * 77 + data[j + 1] * 150 + data[j + 2] * 29) >> 8; return { g, w, h }; }
function down({ g, w, h }, f) { const W = Math.floor(w / f), H = Math.floor(h / f), o = new Uint8ClampedArray(W * H), n = f * f;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0; for (let j = 0; j < f; j++) { const r = (y * f + j) * w + x * f; for (let i = 0; i < f; i++) s += g[r + i]; } o[y * W + x] = s / n; }
  return { g: o, w: W, h: H }; }
function blur({ g, w, h }, r) { if (!r) return { g, w, h }; const t = new Float32Array(w * h), o = new Uint8ClampedArray(w * h), k = 2 * r + 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0; for (let i = -r; i <= r; i++) s += g[y * w + Math.min(w - 1, Math.max(0, x + i))]; t[y * w + x] = s / k; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0; for (let i = -r; i <= r; i++) s += t[Math.min(h - 1, Math.max(0, y + i)) * w + x]; o[y * w + x] = s / k; }
  return { g: o, w, h }; }
function rgba({ g, w, h }) { const d = new Uint8ClampedArray(w * h * 4); for (let i = 0, j = 0; i < g.length; i++, j += 4) { d[j] = d[j + 1] = d[j + 2] = g[i]; d[j + 3] = 255; }
  return typeof ImageData !== 'undefined' ? new ImageData(d, w, h) : { data: d, width: w, height: h, colorSpace: 'srgb' }; }
const first = r => r.find(x => x.isValid && x.text)?.text || null;

export async function scanImage(img, readBarcodes) { // img : { data (RGBA), width, height }
  let t = first(await readBarcodes(img, OPTS)); if (t) return t;
  const base = gray(img), cache = {};
  for (const [f, r] of VARIANTS) { const d = cache[f] ||= down(base, f); if (d.w < 60 || d.h < 60) continue;
    t = first(await readBarcodes(rgba(blur(d, r)), OPTS)); if (t) return t; }
  return null;
}
