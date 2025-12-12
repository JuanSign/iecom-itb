'use server';

import { DB } from '@/lib/DB';
import { verifySession } from '../session';
import { revalidatePath } from 'next/cache';

// --- 1. Manage Team Notes ---

export async function addTeamMessage(teamId: string, message: string, type: 'iecom' | 'nice') {
  const session = await verifySession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    let isMember = false;

    if (type === 'iecom') {
      const res = await DB`SELECT 1 FROM iecom_member WHERE team_id = ${teamId} AND account_id = ${session.account_id}`;
      isMember = res.length > 0;
      
      if (isMember) {
        await DB`UPDATE iecom_team SET messages = array_append(messages, ${message}) WHERE team_id = ${teamId}`;
      }
    } else {
      const res = await DB`SELECT 1 FROM nice_member WHERE team_id = ${teamId} AND account_id = ${session.account_id}`;
      isMember = res.length > 0;

      if (isMember) {
        await DB`UPDATE nice_team SET messages = array_append(messages, ${message}) WHERE team_id = ${teamId}`;
      }
    }

    if (!isMember) return { success: false, message: 'Not a team member' };

    revalidatePath(`/dashboard/${type}`);
    return { success: true, message: 'Note added' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to add note' };
  }
}

export async function removeTeamMessage(teamId: string, messageIndex: number, type: 'iecom' | 'nice') {
  const session = await verifySession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    let currentMessages: string[] = [];
    
    if (type === 'iecom') {
      // 1. Verify Member
      const mem = await DB`SELECT 1 FROM iecom_member WHERE team_id = ${teamId} AND account_id = ${session.account_id}`;
      if (mem.length === 0) return { success: false, message: 'Not a team member' };
      
      // 2. Fetch
      const res = await DB`SELECT messages FROM iecom_team WHERE team_id = ${teamId}`;
      currentMessages = res[0].messages || [];

      // 3. Modify (Remove by index)
      currentMessages.splice(messageIndex, 1);

      // 4. Update (Cast to string[] so TS knows it's a Text Array)
      await DB`UPDATE iecom_team SET messages = ${currentMessages as string[]} WHERE team_id = ${teamId}`;

    } else {
      // Same logic for NICE
      const mem = await DB`SELECT 1 FROM nice_member WHERE team_id = ${teamId} AND account_id = ${session.account_id}`;
      if (mem.length === 0) return { success: false, message: 'Not a team member' };
      
      const res = await DB`SELECT messages FROM nice_team WHERE team_id = ${teamId}`;
      currentMessages = res[0].messages || [];

      currentMessages.splice(messageIndex, 1);

      await DB`UPDATE nice_team SET messages = ${currentMessages as string[]} WHERE team_id = ${teamId}`;
    }

    revalidatePath(`/dashboard/${type}`);
    return { success: true, message: 'Note removed' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to remove note' };
  }
}

// --- 2. Manage Requests (Approve/Decline) ---

export async function approveRequest(requestId: string, teamId: string, type: 'iecom' | 'nice') {
  const session = await verifySession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    if (type === 'iecom') {
      // 1. Verify Membership
      const mem = await DB`SELECT 1 FROM iecom_member WHERE team_id = ${teamId} AND account_id = ${session.account_id}`;
      if (mem.length === 0) return { success: false, message: 'Not a team member' };

      // 2. Verify Team Size
      const team = await DB`SELECT count FROM iecom_team WHERE team_id = ${teamId}`;
      if (team[0].count >= 3) return { success: false, message: 'Team is full' };

      // 3. ATOMIC TRANSACTION (Using CTEs)
      // This performs Delete, Insert, and Update in one single round-trip query.
      await DB`
        WITH deleted_request AS (
          DELETE FROM iecom_team_request 
          WHERE id = ${requestId} 
          RETURNING account_id, name, institution
        ),
        inserted_member AS (
          INSERT INTO iecom_member (account_id, team_id, name, institution, email)
          SELECT account_id, ${teamId}, name, institution, 'pending@email.com'
          FROM deleted_request
          RETURNING team_id
        )
        UPDATE iecom_team 
        SET count = count + 1 
        WHERE team_id = (SELECT team_id FROM inserted_member);
      `;

    } else {
      // NICE LOGIC
      const mem = await DB`SELECT 1 FROM nice_member WHERE team_id = ${teamId} AND account_id = ${session.account_id}`;
      if (mem.length === 0) return { success: false, message: 'Not a team member' };

      const team = await DB`SELECT count FROM nice_team WHERE team_id = ${teamId}`;
      if (team[0].count >= 3) return { success: false, message: 'Team is full' };

      // ATOMIC TRANSACTION (Using CTEs)
      await DB`
        WITH deleted_request AS (
          DELETE FROM nice_team_request 
          WHERE id = ${requestId} 
          RETURNING account_id, name, institution
        ),
        inserted_member AS (
          INSERT INTO nice_member (account_id, team_id, name, institution, email)
          SELECT account_id, ${teamId}, name, institution, 'pending@email.com'
          FROM deleted_request
          RETURNING team_id
        )
        UPDATE nice_team 
        SET count = count + 1 
        WHERE team_id = (SELECT team_id FROM inserted_member);
      `;
    }

    revalidatePath(`/dashboard/${type}`);
    return { success: true, message: 'Member approved' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to approve' };
  }
}

export async function declineRequest(requestId: string, teamId: string, type: 'iecom' | 'nice') {
  const session = await verifySession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    if (type === 'iecom') {
      const mem = await DB`SELECT 1 FROM iecom_member WHERE team_id = ${teamId} AND account_id = ${session.account_id}`;
      if (mem.length === 0) return { success: false, message: 'Not a team member' };
      
      await DB`DELETE FROM iecom_team_request WHERE id = ${requestId}`;
    } else {
      const mem = await DB`SELECT 1 FROM nice_member WHERE team_id = ${teamId} AND account_id = ${session.account_id}`;
      if (mem.length === 0) return { success: false, message: 'Not a team member' };
      
      await DB`DELETE FROM nice_team_request WHERE id = ${requestId}`;
    }

    revalidatePath(`/dashboard/${type}`);
    return { success: true, message: 'Request declined' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to decline' };
  }
}