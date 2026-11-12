/**
 * Seeds the LOCAL Firestore emulator with clearly labelled test articles for browser checks.
 * Never point this at production: it refuses to run without FIRESTORE_EMULATOR_HOST.
 *
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8085 node tests/e2e/seed-emulator.mjs
 */
import fs from 'fs';

const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host) {
  console.error('FIRESTORE_EMULATOR_HOST is not set; refusing to write anywhere else.');
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const base = `http://${host}/v1/projects/${cfg.projectId}/databases/${encodeURIComponent(cfg.firestoreDatabaseId || '(default)')}/documents`;

const cats = ['national', 'state', 'politics', 'business', 'sports', 'tech', 'entertainment', 'world', 'lifestyle'];
const hindi = { national: 'देश', state: 'राज्य', politics: 'राजनीति', business: 'बिज़नेस', sports: 'खेल', tech: 'टेक', entertainment: 'मनोरंजन', world: 'दुनिया', lifestyle: 'लाइफ़स्टाइल' };
const svg = (n) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><rect width="1200" height="675" fill="#${['d9dde3', 'cfd5dc', 'e3e6ea', 'c9cfd7'][n % 4]}"/><text x="600" y="350" font-size="48" text-anchor="middle" fill="#5f6875" font-family="sans-serif">TEST IMAGE ${n}</text></svg>`);

const v = (x) =>
  typeof x === 'boolean' ? { booleanValue: x }
  : typeof x === 'number' ? { integerValue: String(x) }
  : Array.isArray(x) ? { arrayValue: { values: x.map(v) } }
  : { stringValue: String(x) };

const now = Date.now();
const docs = [];
for (let i = 0; i < 24; i++) {
  const c = cats[i % cats.length];
  const created = new Date(now - i * 47 * 60_000).toISOString();
  docs.push({
    id: `test_${String(i + 1).padStart(2, '0')}`,
    title: `परीक्षण ख़बर ${i + 1}: ${hindi[c]} डेस्क की यह शीर्षक पंक्ति लेआउट जांचने के लिए लंबी रखी गई है`,
    summary: `यह परीक्षण सारांश है। इसका उद्देश्य केवल डिज़ाइन, पंक्ति-ऊंचाई और कार्ड लेआउट की जांच करना है; यह वास्तविक ख़बर नहीं है।`,
    content:
      '<p>यह परीक्षण लेख का पहला अनुच्छेद है। यह केवल स्थानीय एमुलेटर में मौजूद है और वास्तविक ख़बर नहीं है।</p>' +
      '<h2>परीक्षण उपशीर्षक</h2>' +
      Array.from({ length: 6 }, (_, k) => `<p>अनुच्छेद ${k + 2}: देवनागरी पाठ की पठनीयता, मात्राओं की ऊंचाई और पंक्ति-अंतर जांचने के लिए यह वाक्य दोहराया गया है। पाठ लंबा है ताकि कई पंक्तियाँ बनें।</p>`).join('') +
      '<blockquote>यह परीक्षण उद्धरण है।</blockquote>',
    category: c,
    status: i === 20 ? 'draft' : 'published',
    authorName: i % 3 === 0 ? 'परीक्षण लेखक' : 'टेस्ट रिपोर्टर',
    authorUid: 'test-author',
    authorRole: 'परीक्षण भूमिका',
    location: 'परीक्षण शहर',
    imageUrl: i % 5 === 4 ? '' : svg(i),
    imageAltText: 'परीक्षण चित्र',
    imageCaption: 'परीक्षण कैप्शन',
    tags: ['परीक्षण', hindi[c]],
    highlights: i === 0 ? ['पहला परीक्षण बिंदु', 'दूसरा परीक्षण बिंदु', 'तीसरा परीक्षण बिंदु'] : [],
    isBreaking: i === 0,
    isTopStory: i === 1,
    videoUrl: i % 7 === 3 ? 'https://www.youtube.com/watch?v=test' : '',
    viewsCount: 24 - i,
    likesCount: 0,
    createdAt: created,
    updatedAt: created,
  });
}

for (const d of docs) {
  const fields = Object.fromEntries(Object.entries(d).map(([k, val]) => [k, v(val)]));
  const res = await fetch(`${base}/articles/${d.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`${d.id}: ${res.status} ${await res.text()}`);
}
// Test newsroom members (emulator only; addresses use the reserved .test domain).
const staff = [
  { email: 'admin@example.test', name: 'Test Admin', role: 'super_admin' },
  { email: 'editor@example.test', name: 'Test Editor', role: 'editor' },
  { email: 'reporter@example.test', name: 'Test Reporter', role: 'reporter' },
];
for (const m of staff) {
  const fields = Object.fromEntries(Object.entries({ ...m, status: 'active', joinedAt: new Date().toISOString(), articlesCount: 0 }).map(([k, val]) => [k, v(val)]));
  const res = await fetch(`${base}/staff/${encodeURIComponent(m.email)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`staff ${m.email}: ${res.status}`);
}
console.log(`seeded ${docs.length} test articles and ${staff.length} test staff into the emulator`);
