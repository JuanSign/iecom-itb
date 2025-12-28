'use server'

import { db } from "@/lib/DB";
import { iecomSubmission, iecomTeamAssignment } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "../../session";

export async function submitAnswer(
  problemId: number, 
  selectedOptionId: string
) {
  const session = await verifySession();
  
  if (!session || !session.account_id) {
    throw new Error("Unauthorized: No active session found.");
  }

  const userAccountId = session.account_id;

  const assignment = await db.query.iecomTeamAssignment.findFirst({
    where: eq(iecomTeamAssignment.memberAccountId, userAccountId),
  });

  if (!assignment) {
    throw new Error("No assignment found for this user.");
  }
  
  const existingSubmission = await db.query.iecomSubmission.findFirst({
    where: and(
      eq(iecomSubmission.memberAccountId, userAccountId),
      eq(iecomSubmission.problemId, problemId)
    )
  });

  if (existingSubmission) {
    await db.update(iecomSubmission)
      .set({ 
        selectedOptionId, 
        isCorrect: false,
        submittedAt: new Date() 
      })
      .where(eq(iecomSubmission.id, existingSubmission.id));
  } else {
    await db.insert(iecomSubmission).values({
      memberAccountId: userAccountId,
      problemId,
      selectedOptionId,
      isCorrect: false,
    });
  }

  return { success: true };
}