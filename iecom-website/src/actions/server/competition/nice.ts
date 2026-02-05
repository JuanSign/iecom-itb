"use server"

import { CreateTeamFormState, createTeamSchema, JoinTeamFormState, joinTeamSchema, UpdateMemberFormState, UploadDocsFormState } from "@/actions/types/Competition";
import { refreshSession, verifySession } from "../session";
import { db, DB } from "@/lib/DB";
import { addMemberToTeam, checkTeamNameExists, deleteMember, fetchTeamPageData, getTeamId, insertNewTeam, updateTeamDocsInDb } from "@/actions/database/nice_team";
import { addEventToAccount, removeEventFromAccount } from "@/actions/database/account";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPresignedUploadUrl, getSignedUrlForR2, uploadFileToR2 } from "@/lib/R2";
import { updateMember } from "@/actions/database/nice_member";
import { NeonDbError } from "@neondatabase/serverless";
import { niceTeam } from "@/lib/schema";
import { eq } from "drizzle-orm";

function generateTeamCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createTeam(
    prevState: CreateTeamFormState,
    formData: FormData
): Promise<CreateTeamFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };

    const validatedFields = createTeamSchema.safeParse({
        teamName: formData.get("teamName"),
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues.map((e) => e.message).join(", ") };
    }

    const { teamName } = validatedFields.data;
    const { account_id, email } = session;

    try {
        const nameTaken = await checkTeamNameExists(teamName);
        if (nameTaken) {
            return { error: "This team name is already taken. Please choose another." };
        }
    } catch (e) {
        console.error("Check name error:", e);
        return { error: "Could not verify team name availability." };
    }

    let newCode = "";
    let isCodeUnique = false;
    let attempts = 0;

    while (!isCodeUnique && attempts < 5) {
        newCode = generateTeamCode();
        const existing = await DB`SELECT 1 FROM nice_team WHERE code = ${newCode}`;
        if (existing.length === 0) isCodeUnique = true;
        attempts++;
    }

    if (!isCodeUnique) return { error: "Failed to generate a unique team code." };

    try {
        await insertNewTeam(teamName, newCode, account_id, email);
        await addEventToAccount(account_id, "NICE");
        await refreshSession(account_id);
    } catch (e) {
        console.error("Create Team Error:", e);
        return { error: "An error occurred. Please try again." };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard/nice/team");
}

export async function joinTeam(
    prevState: JoinTeamFormState,
    formData: FormData
): Promise<JoinTeamFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };

    const rawCode = formData.get("teamCode") as string;
    const validatedFields = joinTeamSchema.safeParse({
        teamCode: rawCode?.toUpperCase(),
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues.map((e) => e.message).join(", ") };
    }

    const { teamCode } = validatedFields.data;
    const { account_id , email} = session;

    try {
        const team = await DB`SELECT team_id FROM nice_team WHERE code = ${teamCode}`;
        if (team.length === 0) return { error: "Invalid team code." };

        const teamId = team[0].team_id;
        
        await addMemberToTeam(teamId, account_id, email);
        
        await addEventToAccount(account_id, "NICE");
        await refreshSession(account_id);

    } catch(e){
        console.error("Join team error:", e);
        
        if (e instanceof Error && e.message === "TEAM_FULL") {
            return { error: "This team has reached the maximum of 3 members." };
        }

        if (e instanceof NeonDbError && e.code === '23505') {
             return { error: "You are already in a team." };
        }

        return { error: "An error occurred while joining." };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard/nice/team");
}

export async function leaveTeam() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;

    try {
        await deleteMember(account_id);
        await removeEventFromAccount(account_id, "NICE");
        await refreshSession(account_id);
    } catch (error) {
        console.error("Leave team error:", error);
    }

    revalidatePath("/dashboard/nice/team");
    redirect("/dashboard");
}

export async function getTeamPageData() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;

    try {
        const data = await fetchTeamPageData(account_id);

        for (const member of data.members) {
            if(member.sc_link) member.sc_link = await getSignedUrlForR2(member.sc_link);
            if(member.sd_link) member.sd_link = await getSignedUrlForR2(member.sd_link);
            if(member.fp_link) member.fp_link = await getSignedUrlForR2(member.fp_link);
        }

        if(data.team.bmc_link) data.team.bmc_link = await getSignedUrlForR2(data.team.bmc_link);
        if(data.team.poo_link) data.team.poo_link = await getSignedUrlForR2(data.team.poo_link);

        if(data.team.commitmentLink) data.team.commitmentLink = await getSignedUrlForR2(data.team.commitmentLink);
        if(data.team.bannerLink) data.team.bannerLink = await getSignedUrlForR2(data.team.bannerLink);
        if(data.team.pptLink) data.team.pptLink = await getSignedUrlForR2(data.team.pptLink);

        return data;
    } catch (e) {
        if ((e as Error).message === "User not assigned to a team.") {
            redirect("/dashboard");
        }
        throw e;
    }
}

export async function updateMemberDetails(
    prevState: UpdateMemberFormState,
    formData: FormData
): Promise<UpdateMemberFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        // 1. Get Text Data
        const name = formData.get("name") as string;
        const institution = formData.get("institution") as string;
        const phoneNum = formData.get("phone_num") as string;
        const idNo = formData.get("id_no") as string;

        // 2. Get KEYS (Strings) - MATCHING IECOM LOGIC
        const scKey = formData.get("sc_key") as string;
        const sdKey = formData.get("sd_key") as string;
        const fpKey = formData.get("fp_key") as string;
        const spKey = formData.get("sp_key") as string;

        // 4. Update Database
        await updateMember(
            account_id,
            name,
            institution,
            phoneNum,
            idNo,
            scKey || null,
            sdKey || null,
            fpKey || null,
            spKey || null 
        );

        revalidatePath("/dashboard/nice/team");
        return { message: "Your details have been saved successfully." };

    } catch (e) {
        console.error("Update Member Error:", e);
        return { error: "An error occurred while saving your details." };
    }
}

export async function uploadNiceTeamDocuments(
    prevState: UploadDocsFormState,
    formData: FormData
): Promise<UploadDocsFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "You are not part of a NICE team." };

        const bmcFile = formData.get("doc_bmc") as File;
        const pooFile = formData.get("doc_poo") as File;

        if ((!bmcFile || bmcFile.size === 0) && (!pooFile || pooFile.size === 0)) {
            return { error: "Please upload at least one document." };
        }

        let bmcKey: string | null = null;
        let pooKey: string | null = null;

        if (bmcFile && bmcFile.size > 0) {
            bmcKey = await uploadFileToR2(bmcFile, `nice/${team_id}/bmc`, account_id);
        }

        if (pooFile && pooFile.size > 0) {
            pooKey = await uploadFileToR2(pooFile, `nice/${team_id}/poo`, account_id);
        }

        await updateTeamDocsInDb(team_id, bmcKey, pooKey);

        revalidatePath("/dashboard/nice/team");
        return { message: "Documents uploaded successfully." };

    } catch (error) {
        console.error("Upload Error:", error);
        return { error: "An error occurred while uploading documents. Please try again." };
    }
}

type NiceStageTwoType = 'payment_proof' | 'proposal';
export type NiceStageThreeType = 'commitment' | 'banner' | 'ppt';

export async function getNiceStageTwoUploadUrl(
    teamId: string, 
    type: NiceStageTwoType, 
    fileName: string,
    fileType: string
) {
    const settings = CONFIG[type];
    const { signedUrl, key } = await getPresignedUploadUrl(settings.folder, fileName, fileType, teamId);
    return { signedUrl, key };
}

const CONFIG: Record<string, { column: 'paymentProofLink' | 'proposalLink'; folder: string }> = {
    'payment_proof': { column: 'paymentProofLink', folder: 'nice/payments' },
    'proposal': { column: 'proposalLink', folder: 'nice/proposals' },
};
const CONFIG_STAGE_3: Record<NiceStageThreeType, { 
    linkColumn: 'commitmentLink' | 'bannerLink' | 'pptLink'; 
    timeColumn: 'commitmentAt' | 'bannerAt' | 'pptAt'; 
    folder: string 
}> = {
    'commitment': { 
        linkColumn: 'commitmentLink', 
        timeColumn: 'commitmentAt', 
        folder: 'nice/commitments' 
    },
    'banner': { 
        linkColumn: 'bannerLink', 
        timeColumn: 'bannerAt', 
        folder: 'nice/banners' 
    },
    'ppt': { 
        linkColumn: 'pptLink', 
        timeColumn: 'pptAt', 
        folder: 'nice/ppts' 
    },
};

export async function saveNiceStageTwoKey(teamId: string, type: string, key: string) {
    const settings = CONFIG[type];
    
    await db.update(niceTeam)
        .set({ [settings.column]: key })
        .where(eq(niceTeam.teamId, teamId));

    revalidatePath("/dashboard/nice/team"); 
    return { success: true };
}

export async function getNiceStageThreeUploadUrl(
    teamId: string, 
    type: NiceStageThreeType, 
    fileName: string,
    fileType: string
) {
    const settings = CONFIG_STAGE_3[type];
    
    const { signedUrl, key } = await getPresignedUploadUrl(
        settings.folder, 
        fileName, 
        fileType, 
        teamId
    );
    
    return { signedUrl, key };
}

export async function saveNiceStageThreeKey(teamId: string, type: NiceStageThreeType, key: string) {
    const settings = CONFIG_STAGE_3[type];
    const now = new Date();
    const timestampWIB = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    await db.update(niceTeam)
        .set({ 
            [settings.linkColumn]: key,
            [settings.timeColumn]: timestampWIB 
        })
        .where(eq(niceTeam.teamId, teamId));

    revalidatePath("/dashboard/nice/team"); 
    return { success: true };
}