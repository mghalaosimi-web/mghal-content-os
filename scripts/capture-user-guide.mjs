import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET_DIR = path.join(process.cwd(), 'docs', 'user-guide', 'images');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const executablePath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;

async function run() {
  console.log('Launching browser with:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars', '--window-size=1440,960'],
    defaultViewport: { width: 1440, height: 960, deviceScaleFactor: 1.5 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('header');

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function clickTabByText(textSnippet) {
    await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll('nav button'));
      const btn = buttons.find((b) => b.textContent && b.textContent.includes(text));
      if (btn) btn.click();
    }, textSnippet);
    await sleep(600);
  }

  // 1. Dashboard Overview
  console.log('Capturing 01-dashboard-overview.png...');
  await clickTabByText('غرفة قيادة Gemini');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await page.screenshot({ path: path.join(TARGET_DIR, '01-dashboard-overview.png') });

  // 2. Commander Chat View
  console.log('Capturing 02-commander-chat-view.png...');
  await page.evaluate(() => {
    const el = document.querySelector('section') || document.querySelector('input');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await sleep(400);
  await page.screenshot({ path: path.join(TARGET_DIR, '02-commander-chat-view.png') });

  // 3. Autonomous Scheduler Card
  console.log('Capturing 03-autonomous-scheduler-card.png...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, section'));
    const sched = cards.find((c) => c.textContent && c.textContent.includes('المجدول الذاتي') && c.textContent.includes('دورة'));
    if (sched) sched.scrollIntoView({ behavior: 'instant', block: 'center' });
    else window.scrollTo(0, 300);
  });
  await sleep(400);
  await page.screenshot({ path: path.join(TARGET_DIR, '03-autonomous-scheduler-card.png') });

  // 4. Image Studio Canvas
  console.log('Capturing 04-image-studio-canvas.png...');
  await clickTabByText('استوديو الصور');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await page.screenshot({ path: path.join(TARGET_DIR, '04-image-studio-canvas.png') });

  // 5. Image Studio Controls & Theme
  console.log('Capturing 05-image-studio-controls.png...');
  await page.evaluate(() => {
    // switch theme to cyber-purple or royal-gold
    const buttons = Array.from(document.querySelectorAll('button'));
    const themeBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Royal') || b.textContent.includes('ذهبي') || b.textContent.includes('بنفسجي')));
    if (themeBtn) themeBtn.click();
    window.scrollTo(0, 200);
  });
  await sleep(600);
  await page.screenshot({ path: path.join(TARGET_DIR, '05-image-studio-controls.png') });

  // 6. Image Studio Rendered Gallery
  console.log('Capturing 06-image-studio-rendered.png...');
  await page.evaluate(() => {
    const galleryHeading = Array.from(document.querySelectorAll('h2, h3, div')).find(
      (el) => el.textContent && el.textContent.includes('معرض الصور')
    );
    if (galleryHeading) galleryHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo(0, 700);
  });
  await sleep(400);
  await page.screenshot({ path: path.join(TARGET_DIR, '06-image-studio-rendered.png') });

  // 7. Drafts Library
  console.log('Capturing 07-drafts-library.png...');
  await clickTabByText('المسودات');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await page.screenshot({ path: path.join(TARGET_DIR, '07-drafts-library.png') });

  // 8. Content Variant Facebook
  console.log('Capturing 08-content-variant-facebook.png...');
  await page.evaluate(() => {
    const fbBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes('Facebook')
    );
    if (fbBtn) fbBtn.click();
    window.scrollTo(0, 150);
  });
  await sleep(500);
  await page.screenshot({ path: path.join(TARGET_DIR, '08-content-variant-facebook.png') });

  // 9. Content Variant Instagram
  console.log('Capturing 09-content-variant-instagram.png...');
  await page.evaluate(() => {
    const igBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes('Instagram')
    );
    if (igBtn) igBtn.click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(TARGET_DIR, '09-content-variant-instagram.png') });

  // 10. Content Variant TikTok
  console.log('Capturing 10-content-variant-tiktok.png...');
  await page.evaluate(() => {
    const ttBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes('TikTok')
    );
    if (ttBtn) ttBtn.click();
  });
  await sleep(500);
  await page.screenshot({ path: path.join(TARGET_DIR, '10-content-variant-tiktok.png') });

  // 11. Connected Accounts Overview
  console.log('Capturing 11-connected-accounts-overview.png...');
  await clickTabByText('ربط الحسابات');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await page.screenshot({ path: path.join(TARGET_DIR, '11-connected-accounts-overview.png') });

  // 12. Meta Facebook Connection Card
  console.log('Capturing 12-meta-facebook-connection.png...');
  await page.evaluate(() => {
    const fbCard = Array.from(document.querySelectorAll('div, section')).find(
      (c) => c.textContent && c.textContent.includes('فيسبوك') && c.textContent.includes('Page ID')
    );
    if (fbCard) fbCard.scrollIntoView({ behavior: 'instant', block: 'center' });
    else window.scrollTo(0, 150);
  });
  await sleep(400);
  await page.screenshot({ path: path.join(TARGET_DIR, '12-meta-facebook-connection.png') });

  // 13. Meta Instagram Connection Card
  console.log('Capturing 13-meta-instagram-connection.png...');
  await page.evaluate(() => {
    const igCard = Array.from(document.querySelectorAll('div, section')).find(
      (c) => c.textContent && c.textContent.includes('إنستغرام') && c.textContent.includes('Instagram Account ID')
    );
    if (igCard) igCard.scrollIntoView({ behavior: 'instant', block: 'center' });
    else window.scrollTo(0, 450);
  });
  await sleep(400);
  await page.screenshot({ path: path.join(TARGET_DIR, '13-meta-instagram-connection.png') });

  // 14. TikTok Connection Card
  console.log('Capturing 14-tiktok-connection.png...');
  await page.evaluate(() => {
    const ttCard = Array.from(document.querySelectorAll('div, section')).find(
      (c) => c.textContent && c.textContent.includes('تيك توك') && c.textContent.includes('TikTok')
    );
    if (ttCard) ttCard.scrollIntoView({ behavior: 'instant', block: 'center' });
    else window.scrollTo(0, 750);
  });
  await sleep(400);
  await page.screenshot({ path: path.join(TARGET_DIR, '14-tiktok-connection.png') });

  // 15. Audit Logs
  console.log('Capturing 15-audit-logs-view.png...');
  await clickTabByText('سجل العمليات');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await page.screenshot({ path: path.join(TARGET_DIR, '15-audit-logs-view.png') });

  // 16. System Health
  console.log('Capturing 16-system-health.png...');
  await clickTabByText('حالة البنية');
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await page.screenshot({ path: path.join(TARGET_DIR, '16-system-health.png') });

  // Open Onboarding Modal
  console.log('Opening Onboarding Guide modal...');
  await page.evaluate(() => {
    const guideBtn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes('دليل البدء')
    );
    if (guideBtn) guideBtn.click();
  });
  await sleep(600);

  // Helper to click guide tab inside modal
  async function clickGuideTab(idOrText) {
    await page.evaluate((target) => {
      const modalButtons = Array.from(document.querySelectorAll('div[role="dialog"] button, button'));
      const targetBtn = modalButtons.find((b) => b.textContent && b.textContent.includes(target));
      if (targetBtn) targetBtn.click();
    }, idOrText);
    await sleep(400);
  }

  // 17. Onboarding Meta Guide
  console.log('Capturing 17-onboarding-meta-guide.png...');
  await clickGuideTab('فيسبوك');
  await sleep(300);
  await page.screenshot({ path: path.join(TARGET_DIR, '17-onboarding-meta-guide.png') });

  // 18. Onboarding Instagram Guide
  console.log('Capturing 18-onboarding-instagram-guide.png...');
  await clickGuideTab('إنستغرام');
  await sleep(300);
  await page.screenshot({ path: path.join(TARGET_DIR, '18-onboarding-instagram-guide.png') });

  // 19. Onboarding TikTok Guide
  console.log('Capturing 19-onboarding-tiktok-guide.png...');
  await clickGuideTab('تيك توك');
  await sleep(300);
  await page.screenshot({ path: path.join(TARGET_DIR, '19-onboarding-tiktok-guide.png') });

  // 20. Onboarding Gemini Guide
  console.log('Capturing 20-onboarding-gemini-guide.png...');
  await clickGuideTab('Gemini');
  await sleep(300);
  await page.screenshot({ path: path.join(TARGET_DIR, '20-onboarding-gemini-guide.png') });

  await browser.close();
  console.log('All 20 screenshots captured successfully in:', TARGET_DIR);
}

run().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
