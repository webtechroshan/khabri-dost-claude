import { auth } from '../firebase';

/**
 * `fetch` for newsroom API routes: adds the signed-in user's Firebase ID token so the server
 * can check their role. Without a signed-in user the request is sent without a token (and the
 * server answers 401).
 */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const user = auth.currentUser;
  if (user) headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
  return fetch(input, { ...init, headers });
}
