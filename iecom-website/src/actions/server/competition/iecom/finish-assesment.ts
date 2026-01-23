'use server'

import { db } from "@/lib/DB";
import { iecomTeamAssignment, iecomTeamSelectionProgress } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "../../session";
import { redirect } from "next/navigation";

export async function finishExam(reason?: string) {
  const session = await verifySession();
  if (!session) return;

  const assignment = await db.query.iecomTeamAssignment.findFirst({
    where: eq(iecomTeamAssignment.memberAccountId, session.account_id),
  });

  if (!assignment || !assignment.progressId) return;

  await db.update(iecomTeamSelectionProgress)
    .set({
      isCheatingFlagged: !!reason, 
      cheatingReason: reason || null,
      endTime: "NONE", 
    })
    .where(eq(iecomTeamSelectionProgress.id, assignment.progressId));

  redirect("/iecom/exam/finished");
}