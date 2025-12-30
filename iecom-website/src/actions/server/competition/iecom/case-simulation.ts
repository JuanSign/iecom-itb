'use server'

import { db } from "@/lib/DB"; 
import { iecomTeam } from "@/lib/schema";
import { uploadFileToR2 } from "@/lib/R2"; 
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

type DeliverableColumn = 'initialDraftLink' | 'finalReportLink' | 'infographicLink';

export async function uploadDeliverable(
    teamId: string, 
    deliverableType: 'initial_draft' | 'final_report' | 'infographic', 
    formData: FormData
) {
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
        throw new Error("No file selected.");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds the 2MB limit.");
    }

    const config: Record<typeof deliverableType, { column: DeliverableColumn; folder: string }> = {
        'initial_draft': { column: 'initialDraftLink', folder: 'iecom/drafts' },
        'final_report': { column: 'finalReportLink', folder: 'iecom/reports' },
        'infographic': { column: 'infographicLink', folder: 'iecom/infographics' },
    };

    const settings = config[deliverableType];
    
    const uploadedKey = await uploadFileToR2(file, settings.folder, teamId);
    if (!uploadedKey) throw new Error("Upload failed");

    await db.update(iecomTeam)
        .set({
            [settings.column]: uploadedKey
        })
        .where(eq(iecomTeam.teamId, teamId));

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

    revalidatePath("/dashboard/iecom");
    return { success: true };
}