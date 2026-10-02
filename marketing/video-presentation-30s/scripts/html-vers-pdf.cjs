// Imprime une page HTML locale en PDF A4 (Chrome headless de Remotion).
// Usage : node scripts/html-vers-pdf.cjs <fichier.html> <sortie.pdf> "<texte du pied de page>"
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME = path.join(__dirname, "..", "node_modules", ".remotion", "chrome-headless-shell", "win64", "chrome-headless-shell-win64", "chrome-headless-shell.exe");

(async () => {
  const [entree, sortie, pied = ""] = process.argv.slice(2);
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage();
  await page.goto("file:///" + path.resolve(entree).split(path.sep).join("/"), { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluateHandle("document.fonts.ready");
  await page.pdf({
    path: sortie,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="width:100%;font-size:8px;color:#8a93a6;padding:0 15mm;display:flex;justify-content:space-between;font-family:sans-serif"><span>${pied}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    margin: { top: "16mm", bottom: "18mm", left: "15mm", right: "15mm" },
  });
  await browser.close();
  console.log("ok");
})();
