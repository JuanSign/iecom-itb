'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { createAccount, getAccountByEmail } from '@/actions/database/account';
import { createSession, deleteSession } from '@/actions/server/session';
import { AuthSchema, AuthState } from '../types/Auth';

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const result = AuthSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { success: false, error: 'Invalid email or password (min 6 chars).' };
  }

  const { email, password } = result.data;

  try {
    const existingUser = await getAccountByEmail(email);
    if (existingUser) {
      return { success: false, error: 'Email already in use.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createAccount(email, hashedPassword);

    return { success: true, message: 'Account created! Please log in.' };

  } catch (error) {
    console.error('Registration Error:', error);
    return { success: false, error: 'Failed to create account.' };
  }
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const result = AuthSchema.safeParse(Object.fromEntries(formData));
  
  if (!result.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { email, password } = result.data;

  try {
    const account = await getAccountByEmail(email);

    if (!account) {
      return { success: false, error: 'Invalid credentials.' };
    }

    const passwordsMatch = await bcrypt.compare(password, account.password);
    if (!passwordsMatch) {
      return { success: false, error: 'Invalid credentials.' };
    }

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
  redirect('/login');
}