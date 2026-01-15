'use server'

import { db } from "@/lib/DB"; 
import { iecomTeam } from "@/lib/schema";
import { getPresignedUploadUrl } from "@/lib/R2"; 
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type DeliverableType = 'initial_draft' | 'final_report' | 'infographic';

const CONFIG: Record<DeliverableType, { column: 'initialDraftLink' | 'finalReportLink' | 'infographicLink'; folder: string }> = {
    'initial_draft': { column: 'initialDraftLink', folder: 'iecom/drafts' },
    'final_report': { column: 'finalReportLink', folder: 'iecom/reports' },
    'infographic': { column: 'infographicLink', folder: 'iecom/infographics' },
};

export async function getDeliverableUploadUrl(
    teamId: string, 
    deliverableType: DeliverableType, 
    fileName: string,
    fileType: string
) {
    const settings = CONFIG[deliverableType];
    if (!settings) throw new Error("Invalid deliverable type");

    const { signedUrl, key } = await getPresignedUploadUrl(
        settings.folder, 
        fileName, 
        fileType, 
        teamId
    );

    return { signedUrl, key };
}

export async function saveDeliverableKey(
    teamId: string, 
    deliverableType: DeliverableType, 
    key: string
) {
    const settings = CONFIG[deliverableType];
    
    await db.update(iecomTeam)
        .set({
            [settings.column]: key
        })
        .where(eq(iecomTeam.teamId, teamId));

    revalidatePath("/dashboard/iecom/team"); 
    revalidatePath("/dashboard/iecom"); 
    return { success: true };
}

export async function submitVideoLink(teamId: string, link: string) {
    if (!link) throw new Error("Link is required");
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(link)) {
        throw new Error("Please enter a valid YouTube URL.");
    }

    await db.update(iecomTeam)
        .set({ videoLink: link })
        .where(eq(iecomTeam.teamId, teamId));

    revalidatePath("/dashboard/iecom/team"); 
    revalidatePath("/dashboard/iecom"); 
    return { success: true };
}