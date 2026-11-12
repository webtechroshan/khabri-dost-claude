/**
 * Scheduler against the Firestore emulator (runs inside `npm run test:rules`).
 * Uses firebase-admin exactly as the server does.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeApp, deleteApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { runSchedulerOnce } from '../../server/scheduler';

let app: App;
let db: Firestore;
const now = Date.parse('2026-11-12T10:00:00Z');

beforeAll(async () => {
  process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8085';
  app = initializeApp({ projectId: 'demo-khabri-dost-scheduler' }, 'scheduler-test');
  db = getFirestore(app);
  const base = { title: 'परीक्षण', content: '<p>x</p>', summary: '', category: 'national', authorName: 'T', authorUid: 'u' };
  await db.doc('articles/due').set({ ...base, status: 'scheduled', scheduledFor: '2026-11-12T09:30:00Z', createdAt: '2026-11-10T00:00:00Z' });
  await db.doc('articles/later').set({ ...base, status: 'scheduled', scheduledFor: '2026-11-12T11:00:00Z', createdAt: '2026-11-10T00:00:00Z' });
  await db.doc('articles/draft').set({ ...base, status: 'draft', scheduledFor: '2026-11-12T09:00:00Z', createdAt: '2026-11-10T00:00:00Z' });
});

afterAll(async () => {
  await deleteApp(app);
});

describe('runSchedulerOnce (emulator)', () => {
  it('publishes due articles with the scheduled time as publishedAt, and nothing else', async () => {
    let refreshed = 0;
    const count = await runSchedulerOnce(db, now, () => refreshed++);
    expect(count).toBe(1);
    expect(refreshed).toBe(1);
    const due = (await db.doc('articles/due').get()).data()!;
    expect(due.status).toBe('published');
    expect(due.publishedAt).toBe('2026-11-12T09:30:00.000Z');
    expect(due.publishedBy).toBe('scheduler');
    expect((await db.doc('articles/later').get()).data()!.status).toBe('scheduled');
    expect((await db.doc('articles/draft').get()).data()!.status).toBe('draft');
  });

  it('is idempotent: a second run publishes nothing', async () => {
    expect(await runSchedulerOnce(db, now)).toBe(0);
  });
});
