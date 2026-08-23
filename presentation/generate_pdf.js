const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const htmlPath = path.resolve('/Users/manishkumar/Desktop/SentixAi_Presentation/SentixAi_Presentation.html');
  console.log('Loading HTML:', htmlPath);
  
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for images to load
  await new Promise(r => setTimeout(r, 3000));

  const pdfPath = '/Users/manishkumar/Desktop/SentixAi_Presentation.pdf';
  console.log('Generating PDF...');
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: false
  });

  console.log('PDF saved to:', pdfPath);
  await browser.close();
  console.log('Done!');
})();
