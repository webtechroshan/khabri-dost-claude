/**
 * Server-side scheduled publishing.
 *
 * Every minute the server publishes articles whose status is "scheduled" and whose `scheduledFor`
 * time has passed. This is the only server code that writes to Firestore, so it needs a credential:
 *
 *   FIREBASE_SERVICE_ACCOUNT_FILE=/etc/khabri-dost/service-account.json   (recommended)
 *   or GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *
 * Keep that file outside the repository and readable only by the server user. Without a credential
 * the scheduler stays off and logs one notice; editors' browsers still publish due articles while the
 * newsroom is open (the old fallback). With FIRESTORE_EMULATOR_HOST set it runs against the emulator
 * without any credential (local tests).
 */
import fs from 'fs';
import { firebaseProjectId, firestoreDatabaseId } from './config';

export interface ScheduledDoc {
  id: string;
  status?: string;
  scheduledFor?: string;
}

/** Pure selection: which scheduled articles are due at `nowMs`. */
export function dueArticles<T extends ScheduledDoc>(docs: T[], nowMs = Date.now()): T[] {
  return docs.filter((d) => {
    if (d.status !== 'scheduled' || !d.scheduledFor) return false;
    const t = Date.parse(d.scheduledFor);
    return !Number.isNaN(t) && t <= nowMs;
  });
}

export type SchedulerState = 'off' | 'on' | 'error';

let state: SchedulerState = 'off';
let reason = 'not started';
let lastRunAt: string | null = null;
let lastPublished = 0;
let timer: NodeJS.Timeout | null = null;

export const schedulerStatus = () => ({ state, reason, lastRunAt, lastPublished });

type Db = import('firebase-admin/firestore').Firestore;

async function openDatabase(): Promise<Db | null> {
  const projectId = firebaseProjectId();
  if (!projectId) {
    reason = 'no Firebase project id';
    return null;
  }
  const emulator = !!process.env.FIRESTORE_EMULATOR_HOST;
  const file = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!emulator && !file) {
    reason = 'no service account configured (set FIREBASE_SERVICE_ACCOUNT_FILE)';
    return null;
  }
  const { initializeApp, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const name = 'kd-scheduler';
  const existing = getApps().find((a) => a.name === name);
  let app = existing;
  if (!app) {
    if (emulator) {
      app = initializeApp({ projectId }, name);
    } else {
      const json = JSON.parse(fs.readFileSync(file!, 'utf8'));
      if (json.project_id && json.project_id !== projectId) {
        reason = 'service account belongs to a different Firebase project';
        return null;
      }
      app = initializeApp({ credential: cert(json), projectId }, name);
    }
  }
  const dbId = firestoreDatabaseId();
  return dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
}

/** One pass: publish every due article. Returns how many were published. */
export async function runSchedulerOnce(db: Db, nowMs = Date.now(), onPublished?: () => void): Promise<number> {
  const snap = await db.collection('articles').where('status', '==', 'scheduled').limit(200).get();
  const due = dueArticles(
    snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ScheduledDoc, 'id'>) })),
    nowMs
  );
  let published = 0;
  for (const art of due) {
    const ref = db.collection('articles').doc(art.id);
    // A transaction so two server instances never publish the same article twice,
    // and an editor's change made in the meantime wins.
    const done = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(ref);
      const data = fresh.data() as ScheduledDoc | undefined;
      if (!data || dueArticles([{ ...data, id: art.id }], nowMs).length === 0) return false;
      const at = new Date(Math.max(Date.parse(data.scheduledFor!), 0)).toISOString();
      tx.update(ref, { status: 'published', publishedAt: at, updatedAt: new Date(nowMs).toISOString(), publishedBy: 'scheduler' });
      return true;
    });
    if (done) published++;
  }
  if (published > 0) onPublished?.();
  return published;
}

/** Start the minute-by-minute job. Safe to call once at server start. */
export async function startScheduler(onPublished?: () => void): Promise<void> {
  if (process.env.SCHEDULER_DISABLED === 'true') {
    state = 'off';
    reason = 'disabled by SCHEDULER_DISABLED';
    console.log('Scheduler: off (SCHEDULER_DISABLED=true).');
    return;
  }
  let db: Db | null = null;
  try {
    db = await openDatabase();
  } catch (e) {
    state = 'error';
    reason = `could not open Firestore: ${(e as Error).message}`;
    console.warn(`Scheduler: ${reason}`);
    return;
  }
  if (!db) {
    state = 'off';
    console.log(`Scheduler: off — ${reason}. Scheduled articles publish only while an editor has the newsroom open.`);
    return;
  }
  state = 'on';
  reason = process.env.FIRESTORE_EMULATOR_HOST ? 'running against the Firestore emulator' : 'running';
  const interval = Math.max(5_000, Number(process.env.SCHEDULER_INTERVAL_MS) || 60_000);
  const tick = async () => {
    try {
      lastPublished = await runSchedulerOnce(db!, Date.now(), onPublished);
      lastRunAt = new Date().toISOString();
      if (lastPublished > 0) console.log(`Scheduler: published ${lastPublished} article(s).`);
      if (state === 'error') {
        state = 'on';
        reason = 'running';
      }
    } catch (e) {
      state = 'error';
      reason = (e as Error).message;
      console.warn('Scheduler run failed:', reason);
    }
  };
  await tick();
  timer = setInterval(tick, interval);
  timer.unref?.();
  console.log(`Scheduler: on (every ${Math.round(interval / 1000)}s).`);
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}
