const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + process.argv[2] + '/title3.html', { waitUntil: 'networkidle' });
  await p.waitForSelector('body[data-ready="1"]');
  await p.screenshot({ path: process.argv[2] + '/h2-baslik-v3.png', omitBackground: true });
  await p.evaluate(() => { document.documentElement.style.background = document.body.style.background = 'linear-gradient(180deg,#0b2230 0%,#123347 50%,#04090d 100%)'; });
  await p.screenshot({ path: process.argv[2] + '/h2-onizleme-v3.png' });
  await b.close();
})();
