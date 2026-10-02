// Capture d'un site (rendu JS) : texte visible + captures desktop et mobile.
// Usage : node scripts/capture-site.cjs <url> <dossier-sortie>
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer-core");

const CHROME = path.join(__dirname, "..", "node_modules", ".remotion", "chrome-headless-shell", "win64", "chrome-headless-shell-win64", "chrome-headless-shell.exe");

(async () => {
  const [url, out] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage();
  for (const [nom, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true }]]) {
    await page.setViewport(vp);
    await page.goto(url, { waitUntil: process.env.ATTENTE || "networkidle0", timeout: 60000 }); await new Promise((r) => setTimeout(r, 2500));
    // fait défiler pour déclencher les animations d'apparition
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(out, `${nom}-hero.png`) });
    await page.screenshot({ path: path.join(out, `${nom}-full.png`), fullPage: true });
  }
  const texte = await page.evaluate(() => document.body.innerText);
  const liens = await page.evaluate(() => [...document.querySelectorAll("a")].map((a) => `${a.innerText.trim()} -> ${a.href}`));
  const couleurs = await page.evaluate(() => {
    const c = {};
    document.querySelectorAll("*").forEach((el) => { const s = getComputedStyle(el); [s.color, s.backgroundColor].forEach((v) => { if (v && v !== "rgba(0, 0, 0, 0)") c[v] = (c[v] || 0) + 1; }); });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 15);
  });
  fs.writeFileSync(path.join(out, "texte.txt"), texte + "\n\n--- LIENS ---\n" + liens.join("\n") + "\n\n--- COULEURS ---\n" + couleurs.map((x) => x.join(" : ")).join("\n"));
  await browser.close();
  console.log("ok");
})();
