const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '..', 'play-store', 'screenshots');
fs.mkdirSync(outDir, { recursive: true });

const fileUrl = 'file:///' + path.resolve(__dirname, '..', 'web', 'index.html').replace(/\\/g, '/');

const shots = [
  { name: '01-home.png', selector: 'body' },
  { name: '02-servicos.png', selector: '#servicos' },
  { name: '03-agenda.png', selector: '#agenda' },
  { name: '04-local.png', selector: '#local' },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 });
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  for (const shot of shots) {
    if (shot.selector !== 'body') {
      await page.evaluate((sel) => document.querySelector(sel).scrollIntoView({ behavior: 'instant', block: 'start' }), shot.selector);
      await page.waitForTimeout(600);
    } else {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: path.join(outDir, shot.name), fullPage: false });
  }

  await browser.close();
})();
