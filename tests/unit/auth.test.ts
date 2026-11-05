import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import express from 'express';
import type { AddressInfo } from 'net';
import { verifyIdToken, requireRole, setCertFetcherForTests, setRoleLookupForTests } from '../../server/auth';

const PROJECT = 'test-project';
process.env.FIREBASE_PROJECT_ID = PROJECT;

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const other = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const KID = 'k1';

function sign(payload: Record<string, unknown>, key = privateKey, kid = KID, alg = 'RS256') {
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const head = enc({ alg, kid, typ: 'JWT' });
  const body = enc(payload);
  const sig = crypto.sign('RSA-SHA256', Buffer.from(`${head}.${body}`), key).toString('base64url');
  return `${head}.${body}.${sig}`;
}

const now = () => Math.floor(Date.now() / 1000);
const claims = (over: Record<string, unknown> = {}) => ({
  aud: PROJECT,
  iss: `https://securetoken.google.com/${PROJECT}`,
  sub: 'uid-1',
  iat: now() - 10,
  exp: now() + 3600,
  email: 'Reporter@Example.com',
  email_verified: true,
  ...over,
});

beforeAll(() => {
  setCertFetcherForTests(async () => ({
    certs: { [KID]: publicKey.export({ type: 'spki', format: 'pem' }).toString() },
    maxAgeSeconds: 3600,
  }));
});

describe('verifyIdToken', () => {
  it('accepts a valid token and lower-cases the email', async () => {
    const u = await verifyIdToken(sign(claims()));
    expect(u).toMatchObject({ uid: 'uid-1', email: 'reporter@example.com', emailVerified: true });
  });
  it.each([
    ['wrong audience', claims({ aud: 'other' })],
    ['wrong issuer', claims({ iss: 'https://evil.example' })],
    ['expired', claims({ exp: now() - 3600 })],
    ['issued in the future', claims({ iat: now() + 3600 })],
    ['no subject', claims({ sub: '' })],
  ])('rejects %s', async (_name, c) => {
    await expect(verifyIdToken(sign(c))).rejects.toThrow();
  });
  it('rejects a token signed with another key', async () => {
    await expect(verifyIdToken(sign(claims(), other.privateKey))).rejects.toThrow('bad signature');
  });
  it('rejects unknown key ids and non-RS256 tokens', async () => {
    await expect(verifyIdToken(sign(claims(), privateKey, 'nope'))).rejects.toThrow();
    await expect(verifyIdToken(sign(claims(), privateKey, KID, 'none'))).rejects.toThrow();
  });
  it('rejects malformed tokens', async () => {
    await expect(verifyIdToken('abc')).rejects.toThrow();
  });
});

describe('requireRole middleware', () => {
  let base = '';
  let server: ReturnType<ReturnType<typeof express>['listen']>;
  beforeAll(async () => {
    setRoleLookupForTests(async (u) => (u.email === 'reporter@example.com' ? 'reporter' : u.email === 'editor@example.com' ? 'editor' : null));
    const app = express();
    app.get('/staff', requireRole('staff'), (_q, r) => r.json({ ok: true }));
    app.get('/editor', requireRole('editor'), (_q, r) => r.json({ ok: true }));
    app.get('/admin', requireRole('admin'), (_q, r) => r.json({ ok: true }));
    server = app.listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => server.close());
  const get = (path: string, token?: string) =>
    fetch(base + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then((r) => r.status);

  it('401 without a token or with a bad token', async () => {
    expect(await get('/staff')).toBe(401);
    expect(await get('/staff', 'garbage')).toBe(401);
  });
  it('403 for a signed-in reader with no staff record', async () => {
    expect(await get('/staff', sign(claims({ email: 'reader@example.com' })))).toBe(403);
  });
  it('reporter passes staff, fails editor', async () => {
    const t = sign(claims());
    expect(await get('/staff', t)).toBe(200);
    expect(await get('/editor', t)).toBe(403);
  });
  it('editor passes editor, fails admin', async () => {
    const t = sign(claims({ email: 'editor@example.com' }));
    expect(await get('/editor', t)).toBe(200);
    expect(await get('/admin', t)).toBe(403);
  });
  it('owner email passes admin only when verified', async () => {
    expect(await get('/admin', sign(claims({ email: 'khabridost.com@gmail.com' })))).toBe(200);
    expect(await get('/admin', sign(claims({ email: 'khabridost.com@gmail.com', email_verified: false })))).toBe(403);
  });
});
