import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { DB } from '@/lib/DB';

export type SessionPayload = {
  account_id: string;
  email: string;
  events: string[] | null;
  expiresAt: Date;
};

if(!process.env.SESSION_SECRET)
    throw new Error('SESSION_SECRET environment variable is not set');
const SECRET_KEY = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(SECRET_KEY);

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);

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
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function refreshSession(account_id: string) {
  const users = await DB`
    SELECT account_id, email, events 
    FROM account 
    WHERE account_id = ${account_id}
  `;

  if (users.length === 0) return;
  const user = users[0];

  const sessionPayload = {
    account_id: user.account_id,
    email: user.email,
    events: user.events || [], 
  };

  const token = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(key); 
    
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}