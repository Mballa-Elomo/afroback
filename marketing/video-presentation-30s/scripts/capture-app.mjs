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
await p.goto('https://afroback-test.vercel.app/', { waitUntil: 'networkidle2', timeout: 60000 });
await sleep(4000);
for (const t of ['Commencer', 'Passer', 'Explorer sans compte']) await click(t);
await sleep(2000);
for (const s of JSON.parse(process.argv[2] || '[]')) {
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
