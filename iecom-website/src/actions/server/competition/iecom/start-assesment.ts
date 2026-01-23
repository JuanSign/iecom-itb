'use server'

import { db } from "@/lib/DB";
import { iecomMember, iecomTeamAssignment, iecomTeamSelectionProgress } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const WINDOW_OPEN_TIME = new Date("2025-12-28T08:50:00+07:00").getTime();
const WINDOW_CLOSE_TIME = new Date("2025-12-30T08:00:00+07:00").getTime(); 
const DURATION_MINUTES = 60;

export async function startTeamAssessment(teamId: string) {
  const now = new Date().getTime();

  if (now < WINDOW_OPEN_TIME) {
    throw new Error("The assessment window is not open yet.");
  }
  if (now > WINDOW_CLOSE_TIME) {
    throw new Error("The assessment window has closed.");
  }

  const existingProgress = await db.query.iecomTeamSelectionProgress.findFirst({
    where: eq(iecomTeamSelectionProgress.teamId, teamId),
  });

  if (existingProgress) {
    redirect("/dashboard/iecom/assesment"); 
  }

  // await db.transaction(async (tx) => {
  //   const doubleCheck = await tx.query.iecomTeamSelectionProgress.findFirst({
  //     where: eq(iecomTeamSelectionProgress.teamId, teamId),
  //   });
  //   if (doubleCheck) return;

  //   const [newProgress] = await tx.insert(iecomTeamSelectionProgress)
  //     .values({
  //       teamId: teamId,
  //       startTime: new Date(),
  //       endTime: new Date(Date.now() + DURATION_MINUTES * 60 * 1000), 
  //     })
  //     .returning();

  //   const members = await tx.select().from(iecomMember)
  //     .where(eq(iecomMember.teamId, teamId));

  //   if (members.length === 0) throw new Error("No members found in team");

  //   const packetIds = [1, 2, 3].sort(() => Math.random() - 0.5);

  //   const assignments = members.map((member, index) => ({
  //     memberAccountId: member.accountId,
  //     packetId: packetIds[index % packetIds.length], 
  //     progressId: newProgress.id,
  //   }));

  //   await tx.insert(iecomTeamAssignment).values(assignments);
  // });

  revalidatePath("/dashboard");
  redirect("/dashboard/iecom/assesment");
}