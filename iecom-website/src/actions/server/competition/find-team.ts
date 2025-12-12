'use server';

import { DB } from '@/lib/DB';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { verifySession } from '../session';

interface ActionState {
  message: string;
  success: boolean;
}

const RequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  institution: z.string().min(1, "Institution is required"),
  description: z.string().optional(),
  teamId: z.string().uuid(),
  type: z.enum(['iecom', 'nice']),
});

export async function requestJoinTeam(
  prevState: ActionState | null, 
  formData: FormData
): Promise<ActionState> {
  
  const session = await verifySession();
  
  const accountId = session?.account_id; 

  if (!session || !accountId) {
    return { message: 'Unauthorized: You must be logged in.', success: false };
  }

  const validatedFields = RequestSchema.safeParse({
    name: formData.get('name'),
    institution: formData.get('institution'),
    description: formData.get('description'),
    teamId: formData.get('teamId'),
    type: formData.get('type'),
  });

  if (!validatedFields.success) {
    return { message: 'Invalid form data provided.', success: false };
  }

  const { name, institution, description, teamId, type } = validatedFields.data;

  try {
    if (type === 'nice') {
      await DB`
        INSERT INTO nice_team_request (team_id, account_id, name, institution, description)
        VALUES (${teamId}, ${accountId}, ${name}, ${institution}, ${description || ''})
      `;
    } else {
      await DB`
        INSERT INTO iecom_team_request (team_id, account_id, name, institution, description)
        VALUES (${teamId}, ${accountId}, ${name}, ${institution}, ${description || ''})
      `;
    }

    revalidatePath(`/dashboard/find-team/${type}`);
    
    return { message: 'Request sent successfully!', success: true };

  } catch (error) {
    console.error('Database Error:', error);

    if (error instanceof Error && error.message.includes('duplicate')) {
        return { message: 'You have already requested to join this team.', success: false };
    }

    return { message: 'Failed to send request. Please try again later.', success: false };
  }
}