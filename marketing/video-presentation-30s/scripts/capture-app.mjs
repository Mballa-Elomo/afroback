/**
 * Capture d'écrans de l'app AFROBACK en ligne (mode invité), pour les vidéos « récit ».
 * Usage : node scripts/capture-app.mjs '<étapes JSON>'
 * Étapes : {"click":"Texte exact"} · {"wait":ms} · {"scroll":px} · {"back":1}
 *          · {"hide":1} (masque le bandeau « Tu explores en invité ») · {"texts":1} (affiche le texte visible)
 *          · {"images":1} (liste les URL des images de la page, à télécharger avec curl)
 *          · {"shot":"nom"} → public/img/capture-app-<nom>.jpg (390 × 844, ×3)
 * L'entrée en mode invité (Commencer → Passer → Explorer sans compte) est faite automatiquement.
 * Exemple : node scripts/capture-app.mjs '[{"click":"Mythes","wait":3000},{"click":"Ngan Medza, le serpent qui porta un peuple sur son dos","wait":4000},{"shot":"ngan-medza"}]'
 * Écouter / Regarder sont réservés aux membres : en invité, on capture la fiche (photo, titre, boutons).
 *
 * Options ajoutées le 2026-10-06 (tutoriel d'inscription, rétrocompatibles) :
 *   {"noguest":1} en PREMIÈRE étape : ne pas entrer en mode invité (reste sur l'écran du logo)
 *   {"goto":"/onboarding/..."} ouvre une adresse de l'app · {"type":["Placeholder","texte"]} tape dans un champ
 *   {"tick":1} coche la case (role=checkbox) · {"digits":"48291"} tape dans le champ de code caché
 *   {"blockverify":1} retient les appels de vérification Supabase (jamais envoyés : l'écran reste en chargement avec 6 chiffres)
 *   {"rect":"Texte exact"} affiche la position (x, y, l, h) de l'élément dans l'écran 390 × 844
 * Ces options ne créent aucun compte et n'envoient aucun formulaire.
 */
import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
async function click(text) {
  const ok = await p.evaluate((t) => {
    const els = [...document.querySelectorAll('div,span,a,button')].filter((e) => e.textContent.trim() === t && e.offsetParent !== null);
    const el = els[els.length - 1];
    if (!el) return false;
    el.click();
    return true;
  }, text);
  console.log('click', JSON.stringify(text), ok ? 'ok' : 'INTROUVABLE');
  await sleep(2500);
}
const STEPS = JSON.parse(process.argv[2] || '[]');
const BASE = 'https://afroback-test.vercel.app';
await p.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(4000);
if (!(STEPS[0] && STEPS[0].noguest)) {
  for (const t of ['Commencer', 'Passer', 'Explorer sans compte']) await click(t);
  await sleep(2000);
}
let blockVerify = false;
await p.setRequestInterception(true);
p.on('request', (r) => {
  if (blockVerify && /\/auth\/v1\/verify/.test(r.url())) { console.log('retenu (jamais envoyé)', r.url()); return; }
  r.continue();
});
for (const s of STEPS) {
  if (s.blockverify) blockVerify = true;
  if (s.goto) { await p.goto(BASE + s.goto, { waitUntil: 'networkidle2', timeout: 60000 }); await sleep(4000); }
  if (s.type) { const el = await p.$(`input[placeholder="${s.type[0]}"]`); if (el) await el.type(s.type[1], { delay: 15 }); console.log('type', s.type[0], el ? 'ok' : 'INTROUVABLE'); await sleep(600); }
  if (s.tick) { await p.evaluate(() => { const el = [...document.querySelectorAll('div')].find((e) => e.getAttribute('role') === 'checkbox'); if (el) el.click(); }); await sleep(600); }
  if (s.digits) { const el = await p.$('input[autocomplete="one-time-code"]') || await p.$('input[inputmode="numeric"]'); if (el) { await el.focus(); await p.keyboard.type(s.digits, { delay: 40 }); } console.log('digits', el ? 'ok' : 'INTROUVABLE'); await sleep(900); }
  if (s.rect) console.log('rect', JSON.stringify(s.rect), JSON.stringify(await p.evaluate((t) => { const els = [...document.querySelectorAll('div,span,a,button,input')].filter((e) => (e.textContent.trim() === t || e.placeholder === t) && e.offsetParent !== null); const e = els[els.length - 1]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; }, s.rect)));
  if (s.click) await click(s.click);
  if (s.wait) await sleep(s.wait);
  if (s.back) { await p.goBack(); await sleep(2500); }
  if (s.scroll) {
    await p.evaluate((y) => document.querySelectorAll('*').forEach((e) => { if (e.scrollHeight > e.clientHeight + 50 && getComputedStyle(e).overflowY !== 'visible') e.scrollTop = y; }), s.scroll);
    await sleep(1200);
  }
  if (s.hide) await p.evaluate(() => [...document.querySelectorAll('div')].filter((e) => e.innerText && e.innerText.trim().startsWith('Tu explores en invité') && e.innerText.length < 60).forEach((e) => { e.style.display = 'none'; if (e.parentElement && e.parentElement.innerText.trim().length < 60) e.parentElement.style.display = 'none'; }));
  if (s.texts) console.log((await p.evaluate(() => document.body.innerText)).slice(0, 600).replace(/\n+/g, ' | '));
  if (s.images) console.log((await p.evaluate(() => [...new Set([...document.querySelectorAll('img')].map((i) => i.currentSrc || i.src).filter((u) => u.startsWith('http') && !u.includes('/assets/')))])).join(' \n'));
  if (s.shot) {
    const png = `public/img/capture-app-${s.shot}.png`;
    await p.screenshot({ path: png, type: 'png' });
    console.log('capture', png, p.url());
  }
}
await b.close();
