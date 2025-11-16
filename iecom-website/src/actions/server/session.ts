import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAccountByID} from '../database/account';

export type SessionPayload = {
  account_id: string;
  email: string;
  events: string[] | null;
  expiresAt: Date;
};

const SESSION_DURATION = 24 * 60 * 60 * 1000;
const SESSION_ALGORITHM = 'HS256';

if(!process.env.SESSION_SECRET)
    throw new Error('SESSION_SECRET environment variable is not set');
const SECRET_KEY = process.env.SESSION_SECRET;
const KEY = new TextEncoder().encode(SECRET_KEY);

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const session = await new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: SESSION_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(KEY);

  const cookieStore = await cookies();
  
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, KEY, {
      algorithms: [SESSION_ALGORITHM],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function refreshSession(account_id: string) {
  const currentSession = await verifySession();
  if(!currentSession) redirect('/register');

  const user = await getAccountByID(account_id);
  if(!user) redirect('/register');

  const sessionPayload = {
    account_id: user.account_id,
    email: user.email,
    events: user.events || [], 
  };

  await createSession(sessionPayload);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}