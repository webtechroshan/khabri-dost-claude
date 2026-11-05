import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import { initializeTestEnvironment, assertSucceeds, assertFails, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where, increment } from 'firebase/firestore';

let env: RulesTestEnvironment;

const user = (uid: string, email: string, verified = true) =>
  env.authenticatedContext(uid, { email, email_verified: verified }).firestore();
const anon = () => env.unauthenticatedContext().firestore();

const OWNER = () => user('owner', 'khabridost.com@gmail.com');
const ADMIN = () => user('admin1', 'admin@example.com');
const EDITOR = () => user('ed1', 'editor@example.com');
const REPORTER = () => user('rep1', 'reporter@example.com');
const SUSPENDED = () => user('sus1', 'suspended@example.com');
const READER = () => user('reader1', 'reader@example.com');

const article = (over: Record<string, unknown> = {}) => ({
  id: 'a1',
  title: 'परीक्षण शीर्षक',
  summary: 'सार',
  content: '<p>सामग्री</p>',
  category: 'national',
  authorName: 'Reporter',
  authorUid: 'rep1',
  status: 'draft',
  viewsCount: 0,
  likesCount: 0,
  createdAt: '2026-11-05T00:00:00Z',
  ...over,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-khabri-dost',
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8085 },
  });
});
afterAll(async () => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const staff = (email: string, role: string, status = 'active') =>
      setDoc(doc(db, 'staff', email), { email, name: email, role, status });
    await staff('admin@example.com', 'super_admin');
    await staff('editor@example.com', 'editor');
    await staff('reporter@example.com', 'reporter');
    await staff('suspended@example.com', 'editor', 'suspended');
    await setDoc(doc(db, 'articles', 'pub'), article({ id: 'pub', status: 'published', authorUid: 'ed1' }));
    await setDoc(doc(db, 'articles', 'draft'), article({ id: 'draft', status: 'draft', authorUid: 'ed1' }));
    await setDoc(doc(db, 'articles', 'mine'), article({ id: 'mine', status: 'draft', authorUid: 'rep1' }));
    await setDoc(doc(db, 'articles', 'nostatus'), { title: 'old', content: 'x', authorUid: 'ed1' });
  });
});

describe('articles', () => {
  it('public can read published only', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'articles', 'pub')));
    await assertFails(getDoc(doc(anon(), 'articles', 'draft')));
    await assertFails(getDoc(doc(anon(), 'articles', 'nostatus')));
    await assertSucceeds(getDocs(query(collection(anon(), 'articles'), where('status', '==', 'published'))));
    await assertFails(getDocs(collection(anon(), 'articles')));
  });
  it('reporters read their own drafts, editors read everything', async () => {
    await assertSucceeds(getDoc(doc(REPORTER(), 'articles', 'mine')));
    await assertFails(getDoc(doc(REPORTER(), 'articles', 'draft')));
    await assertSucceeds(getDocs(query(collection(REPORTER(), 'articles'), where('authorUid', '==', 'rep1'))));
    await assertSucceeds(getDocs(collection(EDITOR(), 'articles')));
  });
  it('reporters may create drafts but not publish', async () => {
    await assertSucceeds(setDoc(doc(REPORTER(), 'articles', 'r1'), article({ id: 'r1' })));
    await assertSucceeds(setDoc(doc(REPORTER(), 'articles', 'r2'), article({ id: 'r2', status: 'pending_review' })));
    await assertFails(setDoc(doc(REPORTER(), 'articles', 'r3'), article({ id: 'r3', status: 'published' })));
    await assertFails(setDoc(doc(REPORTER(), 'articles', 'r4'), article({ id: 'r4', authorUid: 'someone-else' })));
    await assertFails(updateDoc(doc(REPORTER(), 'articles', 'mine'), { status: 'published' }));
  });
  it('editors publish; readers and suspended staff cannot write', async () => {
    await assertSucceeds(updateDoc(doc(EDITOR(), 'articles', 'draft'), { status: 'published' }));
    await assertFails(setDoc(doc(READER(), 'articles', 'x1'), article({ id: 'x1', authorUid: 'reader1' })));
    await assertFails(updateDoc(doc(SUSPENDED(), 'articles', 'draft'), { status: 'published' }));
  });
  it('unverified email gets no staff rights', async () => {
    const db = user('ed1', 'editor@example.com', false);
    await assertFails(updateDoc(doc(db, 'articles', 'draft'), { status: 'published' }));
  });
  it('view counter only +1 on published articles', async () => {
    await assertSucceeds(updateDoc(doc(anon(), 'articles', 'pub'), { viewsCount: increment(1) }));
    await assertFails(updateDoc(doc(anon(), 'articles', 'pub'), { viewsCount: 9999 }));
    await assertFails(updateDoc(doc(anon(), 'articles', 'draft'), { viewsCount: increment(1) }));
  });
  it('only administrators delete', async () => {
    await assertFails(deleteDoc(doc(EDITOR(), 'articles', 'pub')));
    await assertSucceeds(deleteDoc(doc(ADMIN(), 'articles', 'pub')));
    await assertSucceeds(deleteDoc(doc(OWNER(), 'articles', 'draft')));
  });
});

describe('staff and users', () => {
  it('members read their own record; only admins list', async () => {
    await assertSucceeds(getDoc(doc(REPORTER(), 'staff', 'reporter@example.com')));
    await assertFails(getDoc(doc(REPORTER(), 'staff', 'editor@example.com')));
    await assertFails(getDocs(collection(EDITOR(), 'staff')));
    await assertSucceeds(getDocs(collection(ADMIN(), 'staff')));
  });
  it('admins invite staff; nobody escalates themselves', async () => {
    const rec = { email: 'new@example.com', name: 'New', role: 'reporter', status: 'active' };
    await assertSucceeds(setDoc(doc(ADMIN(), 'staff', 'new@example.com'), rec));
    await assertFails(setDoc(doc(EDITOR(), 'staff', 'new2@example.com'), { ...rec, email: 'new2@example.com' }));
    await assertFails(updateDoc(doc(REPORTER(), 'staff', 'reporter@example.com'), { role: 'super_admin' }));
    await assertFails(setDoc(doc(ADMIN(), 'staff', 'bad@example.com'), { ...rec })); // id/email mismatch
    await assertFails(setDoc(doc(ADMIN(), 'staff', 'pin@example.com'), { ...rec, email: 'pin@example.com', accessPin: '1234' }));
  });
  it('only owners create administrators', async () => {
    const rec = { email: 'boss@example.com', name: 'Boss', role: 'super_admin', status: 'active' };
    await assertFails(setDoc(doc(ADMIN(), 'staff', 'boss@example.com'), rec));
    await assertSucceeds(setDoc(doc(OWNER(), 'staff', 'boss@example.com'), rec));
  });
  it('user profiles are private and role cannot be self-set', async () => {
    await assertSucceeds(setDoc(doc(READER(), 'users', 'reader1'), { uid: 'reader1', role: 'reader' }));
    await assertFails(getDoc(doc(anon(), 'users', 'reader1')));
    await assertFails(updateDoc(doc(READER(), 'users', 'reader1'), { role: 'admin' }));
    await assertFails(setDoc(doc(READER(), 'users', 'reader2'), { uid: 'reader2' }));
  });
});

describe('settings, submissions, inquiries, subscribers', () => {
  it('settings are public-read, admin-write, and refuse API keys', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'settings', 'portal_config')));
    await assertFails(setDoc(doc(EDITOR(), 'settings', 'portal_config'), { siteName: 'x' }));
    await assertSucceeds(setDoc(doc(ADMIN(), 'settings', 'portal_config'), { siteName: 'x' }));
    await assertFails(setDoc(doc(ADMIN(), 'settings', 'portal_config'), { geminiApiKey: 'AIza' }));
  });
  it('anyone sends a valid news tip; only editors read them', async () => {
    const tip = {
      id: 'NEWS-2026-123456', title: 'सड़क पर गड्ढे', category: 'state', location: 'जालंधर', incidentDate: '2026-11-05',
      description: 'मुख्य सड़क पर बड़े गड्ढे हैं।', images: [], senderName: 'नागरिक', isAnonymous: false,
      submittedAt: '2026-11-05T00:00:00Z', status: 'pending',
    };
    await assertSucceeds(setDoc(doc(anon(), 'submissions', tip.id), tip));
    await assertFails(setDoc(doc(anon(), 'submissions', 'NEWS-2026-1'), { ...tip, id: 'NEWS-2026-1', status: 'published' }));
    await assertFails(setDoc(doc(anon(), 'submissions', 'NEWS-2026-2'), { ...tip, id: 'NEWS-2026-2', extra: 'x' }));
    await assertFails(getDoc(doc(anon(), 'submissions', tip.id)));
    await assertFails(getDoc(doc(REPORTER(), 'submissions', tip.id)));
    await assertSucceeds(getDoc(doc(EDITOR(), 'submissions', tip.id)));
  });
  it('contact form and newsletter accept only valid shapes', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'inquiries', 'q1'), { id: 'q1', name: 'A', email: 'a@b.co', message: 'नमस्ते' }));
    await assertFails(setDoc(doc(anon(), 'inquiries', 'q2'), { id: 'q2', name: 'A', email: 'a@b.co', message: '' }));
    await assertFails(getDoc(doc(anon(), 'inquiries', 'q1')));
    await assertSucceeds(setDoc(doc(anon(), 'subscribers', 's1'), { id: 's1', email: 'a@b.co', status: 'active', source: 'footer', subscribedAt: 'x' }));
    await assertFails(setDoc(doc(anon(), 'subscribers', 's2'), { id: 's2', email: 'not-an-email', status: 'active' }));
    await assertFails(getDoc(doc(anon(), 'subscribers', 's1')));
  });
  it('unknown collections are denied', async () => {
    await assertFails(getDoc(doc(anon(), 'test', 'x')));
    await assertFails(setDoc(doc(ADMIN(), 'random', 'x'), { a: 1 }));
  });
});
