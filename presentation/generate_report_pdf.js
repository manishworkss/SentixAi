const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const htmlPath = path.resolve('/Users/manishkumar/SentixAi/presentation/SentixAi_Full_Report.html');
  console.log('Loading HTML:', htmlPath);
  
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for rendering
  await new Promise(r => setTimeout(r, 2000));

  const pdfPath = '/Users/manishkumar/Desktop/SentixAi_Full_Report.pdf';
  console.log('Generating PDF...');
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: false,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true
  });

  console.log('PDF saved to:', pdfPath);
  await browser.close();
  console.log('Done!');
})();
