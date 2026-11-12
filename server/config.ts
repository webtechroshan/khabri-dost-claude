/**
 * Server configuration. Public Firebase identifiers come from `firebase-applet-config.json`
 * (the same file the browser uses); environment variables override them.
 */
import fs from 'fs';
import path from 'path';

let fileConfig: { projectId?: string; firestoreDatabaseId?: string } | null = null;

function readFileConfig() {
  if (fileConfig) return fileConfig;
  try {
    fileConfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
  } catch {
    fileConfig = {};
  }
  return fileConfig!;
}

export const firebaseProjectId = () => process.env.FIREBASE_PROJECT_ID || readFileConfig().projectId || '';
export const firestoreDatabaseId = () =>
  process.env.FIRESTORE_DATABASE_ID || readFileConfig().firestoreDatabaseId || '(default)';

/** Public site address used in canonical URLs, sitemaps and feeds. No trailing slash. */
export const siteUrl = () => (process.env.SITE_URL || 'https://khabridost.com').replace(/\/+$/, '');
