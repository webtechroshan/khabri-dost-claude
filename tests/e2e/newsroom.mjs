/**
 * Newsroom (admin) browser test against the local emulators (Firestore + Auth) — never production.
 * Signs in through the Auth emulator as the seeded test members and checks role-based access.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3420';
if (/khabridost\.com/i.test(BASE)) process.exit(1);
const failures = [];
const expect = (ok, msg) => {
  if (!ok) failures.push(msg);
};
const browser = await chromium.launch({ proxy: { server: process.env.HTTPS_PROXY || 'http://127.0.0.1:1', bypass: 'localhost,127.0.0.1' } });

async function open(email, width = 1366) {
  const p = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 768 });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('dialog', (d) => d.accept());
  await p.goto(BASE + '/');
  await p.waitForFunction(() => !!window.__kdTestSignIn, null, { timeout: 15000 });
  await p.evaluate((e) => window.__kdTestSignIn(e), email);
  await p.goto(BASE + '/admin');
  return { p, errors };
}
const nav = (p) => p.$$eval('.kd-nr__navbtn', (b) => b.map((x) => x.querySelector('span')?.textContent.trim() || ''));
const go = async (p, label) => {
  const menu = await p.$('.kd-nr__menu');
  if (menu && (await menu.isVisible())) await menu.click();
  await p.click(`.kd-nr__navbtn:has-text("${label}")`);
  await p.waitForTimeout(500);
};
const overflow = (p) =>
  p.evaluate(() => {
    const m = document.querySelector('.kd-nr__main');
    return Math.max(document.documentElement.scrollWidth - innerWidth, m ? m.scrollWidth - m.clientWidth : 0);
  });
/** Wait until a notice matching `re` appears; returns true when it does. */
const noticeMatches = (p, re) =>
  p
    .waitForFunction((src) => new RegExp(src, 'i').test(document.querySelector('.kd-notice')?.textContent || ''), re.source, { timeout: 8000 })
    .then(() => true)
    .catch(() => false);

// Administrator
for (const width of [1366, 390]) {
  const { p, errors } = await open('admin@example.test', width);
  await p.waitForSelector('.kd-nr', { timeout: 15000 });
  const screens = ['Dashboard', 'News', 'Write article', 'Live coverage', 'Inbox', 'Media', 'Advertisements', 'SEO & sitemaps', 'Settings', 'Audience', 'Users & roles'];
  expect((await nav(p)).length === 11, `admin@${width}: expected 11 screens`);
  for (const s of screens) {
    await go(p, s);
    expect((await p.$$('.kd-nr__main h1')).length === 1, `admin@${width} ${s}: one h1`);
    expect((await overflow(p)) <= 0, `admin@${width} ${s}: horizontal overflow`);
  }
  if (width === 1366) {
    await go(p, 'Write article');
    await p.fill('#ed-title', 'परीक्षण: संपादक की ओर से प्रकाशित ख़बर');
    const body = await p.$('[contenteditable="true"]');
    await body.click();
    await p.keyboard.type('परीक्षण अनुच्छेद।');
    await p.click('button:has-text("Publish now")');
    expect(await noticeMatches(p, /Published/), 'admin: publish from editor');
    await go(p, 'Settings');
    await p.fill('#s-footname', `खबरी दोस्त ${Date.now() % 1000}`);
    await p.click('button:has-text("Save settings")');
    expect(await noticeMatches(p, /saved/), 'admin: save settings');
    await go(p, 'Advertisements');
    await p.click('button:has-text("Save advertisements")');
    expect(await noticeMatches(p, /saved/), 'admin: save advertisements');
    await go(p, 'Users & roles');
    const who = `new${Date.now() % 100000}@example.test`;
    await p.fill('#u-email', who);
    await p.fill('#u-name', 'New Member');
    await p.click('button:has-text("Add member")');
    expect(
      await p.waitForFunction((w) => document.body.textContent.includes(w), who, { timeout: 8000 }).then(() => true).catch(() => false),
      'admin: add a newsroom member'
    );
  }
  expect(errors.length === 0, `admin@${width}: page errors ${errors.join(' | ')}`);
  await p.close();
}

// Reporter
{
  const { p, errors } = await open('reporter@example.test', 390);
  await p.waitForSelector('.kd-nr', { timeout: 15000 });
  const n = await nav(p);
  expect(!n.includes('Advertisements') && !n.includes('Users & roles') && !n.includes('Inbox'), `reporter: restricted nav (${n.join(', ')})`);
  await go(p, 'Write article');
  const buttons = await p.$$eval('.kd-editor__side button', (b) => b.map((x) => x.textContent.trim()));
  expect(!buttons.includes('Publish now'), 'reporter: no publish button');
  await p.fill('#ed-title', 'परीक्षण: रिपोर्टर की ड्राफ़्ट ख़बर');
  const body = await p.$('[contenteditable="true"]');
  await body.click();
  await p.keyboard.type('रिपोर्टर का पाठ।');
  await p.click('button:has-text("Submit for review")');
  expect(await noticeMatches(p, /review/), 'reporter: submit for review');
  expect((await overflow(p)) <= 0, 'reporter@390: overflow');
  expect(errors.length === 0, `reporter: page errors ${errors.join(' | ')}`);
  await p.close();
}

// Signed-in reader without a staff record
{
  const { p } = await open('reader@example.test');
  await p.waitForTimeout(2500);
  expect(!(await p.$('.kd-nr')), 'reader: must not see the newsroom');
  expect(!!(await p.$('[aria-labelledby="staff-login-title"]')), 'reader: sees the sign-in dialog');
  await p.close();
}

await browser.close();
if (failures.length) {
  console.log(`Newsroom test FAILED:\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('Newsroom test passed (admin at 1366 and 390, reporter, reader).');
