import { DB } from '@/lib/DB';
import { Account } from '@/actions/types/Account';

export async function getAccountByEmail(email: string): Promise<Account | undefined> {
  const rows = await DB`SELECT * FROM account WHERE email = ${email}`;
  if (rows.length === 0) return undefined;
  
  return rows[0] as Account;
}

export async function createAccount(email: string, passwordHash: string): Promise<Account> {
  const rows = await DB`
    INSERT INTO account (email, password, created_at, events) 
    VALUES (${email}, ${passwordHash}, NOW(), ${[]}) 
    RETURNING *
  `;
  
  return rows[0] as Account;
}