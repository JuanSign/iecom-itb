'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { createAccount, getAccountByEmail } from '@/actions/database/account';
import { createSession, deleteSession } from '@/actions/server/session';
import { AuthSchema, AuthState } from '../types/Auth';

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const rawData = Object.fromEntries(formData);
  const result = AuthSchema.safeParse(rawData);

  if (!result.success) {
    return { 
      success: false, 
      error: result.error.issues[0].message, 
    };
  }
  const { email, password } = result.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await createAccount(email, hashedPassword);

    return { success: true, message: 'Account created! Please log in.' };
  } catch (error) {
    console.error('Registration Error:', error);

    if(error instanceof Error && error.message == "EMAIL_EXISTS" )
      return { success: false, error: "Email already in use." }
    return { success: false, error: 'Failed to create account.' };
  }
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const rawData = Object.fromEntries(formData);
  const result = AuthSchema.safeParse(rawData);

  if (!result.success) {
    return { 
      success: false, 
      error: result.error.issues[0].message, 
    };
  }
  const { email, password } = result.data;

  try {
    const account = await getAccountByEmail(email);
    if (!account) return { success: false, error: 'Invalid credentials.' };

    const passwordsMatch = await bcrypt.compare(password, account.password);
    if (!passwordsMatch) return { success: false, error: 'Invalid credentials.' };

    await createSession({
      account_id: account.account_id,
      email: account.email,
      events: account.events,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, error: 'Something went wrong.' };
  }

  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/register');
}