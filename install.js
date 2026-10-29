// Invitation d'installation sur smartphone.
// Android (Chrome) : bouton qui déclenche l'installation native. iOS : pas d'API, on affiche la marche à suivre.
import { t } from './i18n.js';
const KEY = 'sd-install-dismissed', PAUSE_DAYS = 14;
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const dismissed = () => { try { return Date.now() - Number(localStorage.getItem(KEY) || 0) < PAUSE_DAYS * 864e5; } catch { return false; } };
const later = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch {} };
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let deferred = null;

function show() {
  if (standalone() || dismissed() || document.querySelector('#install')) return;
  if (document.querySelector('dialog[open]')) return setTimeout(show, 5000); // ne pas couper une saisie en cours
  const ios = isIOS();
  const d = document.createElement('dialog'); d.id = 'install';
  d.innerHTML = `<form method="dialog"><h2>${t('Installer StockDiab')}</h2>
    <p>${t(ios ? "Pour installer StockDiab : appuyez sur le bouton Partager de Safari, puis sur « Sur l'écran d'accueil »." : "Ajoutez StockDiab à votre écran d'accueil pour l'ouvrir comme une application, même sans connexion.")}</p>
    <div class="row"><button type="button" class="ghost" id="inst-later">${t('Plus tard')}</button>${ios ? '' : `<button type="button" class="primary" id="inst-ok">${t('Installer')}</button>`}</div></form>`;
  document.body.append(d); d.showModal();
  d.querySelector('#inst-later').onclick = () => { later(); d.close(); };
  const ok = d.querySelector('#inst-ok');
  if (ok) ok.onclick = async () => { d.close(); if (!deferred) return; deferred.prompt(); const r = await deferred.userChoice; deferred = null; if (r.outcome !== 'accepted') later(); };
  d.onclose = () => d.remove();
}

window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; if (/android/i.test(navigator.userAgent)) setTimeout(show, 3000); });
window.addEventListener('appinstalled', () => { deferred = null; document.querySelector('#install')?.close(); });
if (isIOS()) addEventListener('load', () => setTimeout(show, 3000));
