import { DB } from '@/lib/DB';
import { Account } from '@/actions/types/Account';
import { NeonDbError } from '@neondatabase/serverless';

export async function getAccountByEmail(email: string): Promise<Account | undefined> {
  const rows = await DB`SELECT * FROM account WHERE email = ${email}`;
  if (rows.length === 0) return undefined;
  
  return rows[0] as Account;
}

export async function getAccountByID(account_id: string): Promise<Account | undefined> {
  const rows = await DB`SELECT * FROM account WHERE account_id = ${account_id}`;
  if (rows.length === 0) return undefined;

  return rows[0] as Account;
}

export async function createAccount(email: string, passwordHash: string): Promise<Account> {
  try {
    const rows = await DB`
      INSERT INTO account (email, password) 
      VALUES (${email}, ${passwordHash}) 
      RETURNING *
    `;

    return rows[0] as Account;
  } catch (error) {
    if(error instanceof NeonDbError){
      if(error.code == '23505') throw new Error("EMAIL_EXISTS");
      throw new Error("DATABASE_ERROR");
    }
    throw error;
  }
}

export async function addEventToAccount(account_id: string, eventTag: string) {
  await DB`
    UPDATE account
    SET events = array_append(events, ${eventTag})
    WHERE account_id = ${account_id}
  `;
}

export async function removeEventFromAccount(account_id: string, eventTag: string) {
  await DB`
    UPDATE account
    SET events = array_remove(events, ${eventTag})
    WHERE account_id = ${account_id}
  `;
}