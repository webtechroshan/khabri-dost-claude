/**
 * Server-side staff authentication.
 *
 * The server holds no admin credentials. It verifies the Firebase ID token the browser sends
 * (`Authorization: Bearer <token>`) against Google's public signing certificates, then reads the
 * caller's staff record from Firestore over REST *with the caller's own token*, so the same
 * `firestore.rules` decide what it can see.
 */
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { isOwnerEmail, roleAllows, staffDocId, type RoleLevel } from '../src/utils/roles';
import { firebaseProjectId, firestoreDatabaseId } from './config';

const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

export interface VerifiedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  token: string;
}

export interface StaffIdentity extends VerifiedUser {
  role: string | null;
  owner: boolean;
}

type CertFetcher = () => Promise<{ certs: Record<string, string>; maxAgeSeconds: number }>;

let certCache: { certs: Record<string, string>; expires: number } | null = null;

const defaultCertFetcher: CertFetcher = async () => {
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error(`certificate fetch failed: ${res.status}`);
  const maxAge = /max-age=(\d+)/.exec(res.headers.get('cache-control') || '')?.[1];
  return { certs: (await res.json()) as Record<string, string>, maxAgeSeconds: Number(maxAge) || 3600 };
};

let certFetcher: CertFetcher = defaultCertFetcher;

/** Test hook: replace the certificate source. */
export function setCertFetcherForTests(fetcher: CertFetcher | null) {
  certFetcher = fetcher || defaultCertFetcher;
  certCache = null;
}

async function getCerts(): Promise<Record<string, string>> {
  if (certCache && certCache.expires > Date.now()) return certCache.certs;
  const { certs, maxAgeSeconds } = await certFetcher();
  certCache = { certs, expires: Date.now() + maxAgeSeconds * 1000 };
  return certs;
}

const b64urlJson = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

/** Verify a Firebase ID token. Throws on any problem. */
export async function verifyIdToken(token: string, projectId = firebaseProjectId(), nowMs = Date.now()): Promise<VerifiedUser> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const header = b64urlJson(parts[0]);
  const payload = b64urlJson(parts[1]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('unexpected token header');

  const certs = await getCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error('unknown signing key');
  const ok = crypto.verify(
    'RSA-SHA256',
    Buffer.from(`${parts[0]}.${parts[1]}`),
    crypto.createPublicKey(cert),
    Buffer.from(parts[2], 'base64url')
  );
  if (!ok) throw new Error('bad signature');

  const now = Math.floor(nowMs / 1000);
  const skew = 60;
  if (payload.aud !== projectId) throw new Error('wrong audience');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('wrong issuer');
  if (typeof payload.exp !== 'number' || payload.exp <= now - skew) throw new Error('token expired');
  if (typeof payload.iat !== 'number' || payload.iat > now + skew) throw new Error('token issued in the future');
  if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('missing subject');

  return {
    uid: payload.sub,
    email: typeof payload.email === 'string' ? payload.email.toLowerCase() : null,
    emailVerified: payload.email_verified === true,
    token,
  };
}

type RoleLookup = (user: VerifiedUser) => Promise<string | null>;

const roleCache = new Map<string, { role: string | null; expires: number }>();

/** Read `staff/{email}` with the caller's own token (rules allow a member to read their own record). */
const firestoreRoleLookup: RoleLookup = async (user) => {
  if (!user.email || !user.emailVerified) return null;
  const cached = roleCache.get(user.email);
  if (cached && cached.expires > Date.now()) return cached.role;
  const url =
    `https://firestore.googleapis.com/v1/projects/${firebaseProjectId()}/databases/` +
    `${encodeURIComponent(firestoreDatabaseId())}/documents/staff/${encodeURIComponent(staffDocId(user.email))}`;
  let role: string | null = null;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${user.token}` } });
    if (res.ok) {
      const doc = (await res.json()) as { fields?: Record<string, { stringValue?: string }> };
      const status = doc.fields?.status?.stringValue;
      role = status === 'active' ? doc.fields?.role?.stringValue || null : null;
    }
  } catch {
    role = null;
  }
  roleCache.set(user.email, { role, expires: Date.now() + 60_000 });
  return role;
};

let roleLookup: RoleLookup = firestoreRoleLookup;

/** Test hook: replace the role source. */
export function setRoleLookupForTests(lookup: RoleLookup | null) {
  roleLookup = lookup || firestoreRoleLookup;
  roleCache.clear();
}

export async function identify(req: Request): Promise<StaffIdentity | null> {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;
  const user = await verifyIdToken(match[1].trim());
  const owner = user.emailVerified && isOwnerEmail(user.email);
  const role = owner ? 'super_admin' : await roleLookup(user);
  return { ...user, role, owner };
}

/** Express middleware: 401 without a valid token, 403 when the role is below `level`. */
export function requireRole(level: RoleLevel) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let who: StaffIdentity | null = null;
    try {
      who = await identify(req);
    } catch {
      who = null;
    }
    if (!who) {
      res.status(401).json({ error: 'Sign in required.' });
      return;
    }
    if (!roleAllows(who.role, level, who.owner ? who.email : null)) {
      res.status(403).json({ error: 'Your role does not allow this action.' });
      return;
    }
    (req as Request & { staff?: StaffIdentity }).staff = who;
    next();
  };
}
