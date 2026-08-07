const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent('<h1>Test</h1>');
  await page.pdf({ path: 'test.pdf', format: 'A4' });
  await browser.close();
})();
