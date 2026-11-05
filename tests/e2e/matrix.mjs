/**
 * Browser matrix: every public template at 14 widths (Chromium emulation, not real devices).
 * Run against a LOCAL server backed by the Firestore emulator — never production:
 *
 *   firebase emulators:start --only firestore --project <projectId>
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 node tests/e2e/seed-emulator.mjs
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 VITE_FIRESTORE_EMULATOR=127.0.0.1:8085 PORT=3420 npx tsx server.ts
 *   BASE_URL=http://localhost:3420 npm run test:e2e
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3200';
if (/khabridost\.com/i.test(BASE)) {
  console.error('Refusing to test the production domain.');
  process.exit(1);
}
const WIDTHS = [320, 360, 375, 390, 414, 430, 480, 768, 1024, 1280, 1366, 1440, 1600, 1920];
const PAGES = [
  '/', '/category/sports', '/search?q=%E0%A4%AA%E0%A4%B0%E0%A5%80%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%A3', '/article/test_01', '/article/test_05',
  '/author/%E0%A4%9F%E0%A5%87%E0%A4%B8%E0%A5%8D%E0%A4%9F%20%E0%A4%B0%E0%A4%BF%E0%A4%AA%E0%A5%8B%E0%A4%B0%E0%A5%8D%E0%A4%9F%E0%A4%B0',
  '/tag/%E0%A4%AA%E0%A4%B0%E0%A5%80%E0%A4%95%E0%A5%8D%E0%A4%B7%E0%A4%A3', '/videos', '/live', '/epaper', '/archive', '/about', '/privacy-policy', '/submit-news', '/no-such-page',
];

const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:1', bypass: 'localhost,127.0.0.1' } });
const failures = [];
let checks = 0;
for (const path of PAGES) {
  for (const width of WIDTHS) {
    const phone = width < 768;
    const page = await browser.newPage({ viewport: { width, height: phone ? 844 : 900 }, isMobile: phone, colorScheme: 'dark' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    // Wait until the page has rendered its heading (data comes from the emulator).
    await page.waitForFunction(() => document.querySelector('h1') && !document.querySelector('[aria-busy="true"]'), null, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const vis = (el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden';
      };
      const header = [...document.querySelectorAll('.kd-util,.kd-mast,.kd-nav')].filter(vis).reduce((s, e) => s + e.getBoundingClientRect().height, 0);
      const smallText = [...document.querySelectorAll('body *')].filter(
        (e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12 && !e.closest('.kd-ad__label')
      ).length;
      const bottomBars = [...document.querySelectorAll('body *')].filter((e) => {
        const cs = getComputedStyle(e);
        if (cs.position !== 'fixed' || !vis(e)) return false;
        const r = e.getBoundingClientRect();
        return r.bottom >= innerHeight - 2 && r.width > innerWidth * 0.6;
      }).length;
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        header: Math.round(header),
        smallText,
        bottomBars,
        main: !!document.getElementById('main-content'),
        bg: getComputedStyle(document.body).backgroundColor,
      };
    });
    const tag = `${path} @${width}`;
    const expect = (ok, msg) => {
      checks++;
      if (!ok) failures.push(`${tag}: ${msg}`);
    };
    const expectedStatus = path === '/no-such-page' ? 404 : 200;
    expect(res.status() === expectedStatus, `HTTP ${res.status()} (expected ${expectedStatus})`);
    expect(m.overflow <= 0, `horizontal overflow ${m.overflow}px`);
    expect(m.h1 === 1, `${m.h1} h1 elements`);
    expect(!phone || m.header <= 100, `phone header ${m.header}px`);
    expect(phone || m.header <= 160, `header ${m.header}px`);
    expect(m.bottomBars <= (phone ? 1 : 0), `${m.bottomBars} fixed bottom bars`);
    expect(m.smallText === 0, `${m.smallText} text elements under 12px`);
    expect(m.main, 'no #main-content landmark for the skip link');
    expect(m.bg === 'rgb(255, 255, 255)', `body background ${m.bg} (light theme expected)`);
    expect(errors.length === 0, `page errors: ${errors.join(' | ').slice(0, 200)}`);
    await page.close();
  }
}
await browser.close();
console.log(`${checks - failures.length}/${checks} checks passed (${PAGES.length} pages × ${WIDTHS.length} widths)`);
if (failures.length) {
  console.log(failures.slice(0, 40).join('\n'));
  process.exit(1);
}
