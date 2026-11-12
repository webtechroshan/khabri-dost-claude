import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, connectAuthEmulator, signInWithCredential } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, connectFirestoreEmulator } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

/**
 * Local testing: VITE_FIRESTORE_EMULATOR=127.0.0.1:8085 points the app at the Firestore emulator,
 * so development and browser tests never read or write production data.
 */
const emulator = (import.meta as any).env?.VITE_FIRESTORE_EMULATOR as string | undefined;
if (emulator) {
  const [host, port] = emulator.split(':');
  connectFirestoreEmulator(db, host, Number(port) || 8085);
}

/**
 * Local testing only: VITE_AUTH_EMULATOR=127.0.0.1:9099 uses the Auth emulator and exposes
 * window.__kdTestSignIn(email) so browser tests can sign in as a newsroom member without Google.
 * Never set in production builds.
 */
const authEmulator = (import.meta as any).env?.VITE_AUTH_EMULATOR as string | undefined;
if (authEmulator && typeof window !== 'undefined') {
  connectAuthEmulator(auth, `http://${authEmulator}`, { disableWarnings: true });
  (window as any).__kdTestSignIn = async (email: string, name = 'Test User') => {
    const cred = GoogleAuthProvider.credential(JSON.stringify({ sub: `test-${email}`, email, email_verified: true, name }));
    return signInWithCredential(auth, cred);
  };
}
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/** Kept for compatibility; no longer reads a document on every visit (it cost one read per page view). */
export async function testConnection() {}
