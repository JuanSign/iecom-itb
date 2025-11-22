"use server"

import { CreateTeamFormState, createTeamSchema, JoinTeamFormState, joinTeamSchema, PaymentFormState, UpdateMemberFormState } from "@/actions/types/Competition";
import { refreshSession, verifySession } from "../session";
import { DB } from "@/lib/DB";
import { addMemberToTeam, checkTeamNameExists, deleteMember, fetchTeamPageData, getTeamId, insertNewTeam, updatePayment } from "@/actions/database/iecom_team";
import { addEventToAccount, removeEventFromAccount } from "@/actions/database/account";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedUrlForR2, uploadFileToR2 } from "@/lib/R2";
import { updateMember } from "@/actions/database/iecom_member";
import { NeonDbError } from "@neondatabase/serverless";

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
        const existing = await DB`SELECT 1 FROM iecom_team WHERE code = ${newCode}`;
        if (existing.length === 0) isCodeUnique = true;
        attempts++;
    }

    if (!isCodeUnique) return { error: "Failed to generate a unique team code." };

    try {
        await insertNewTeam(teamName, newCode, account_id, email);
        await addEventToAccount(account_id, "IECOM");
        await refreshSession(account_id);
    } catch (e) {
        console.error("Create Team Error:", e);
        return { error: "An error occurred. Please try again." };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard/iecom/team");
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
    const { account_id, email } = session;

    try {
        const team = await DB`SELECT team_id FROM iecom_team WHERE code = ${teamCode}`;
        if (team.length === 0) return { error: "Invalid team code." };

        const teamId = team[0].team_id;

        await addMemberToTeam(teamId, account_id, email);
        
        await addEventToAccount(account_id, "IECOM");
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
    redirect("/dashboard/iecom/team");
}

export async function leaveTeam() {
    const session = await verifySession();
    if (!session) redirect("/");
    const { account_id } = session;

    try {
        await deleteMember(account_id);
        await removeEventFromAccount(account_id, "IECOM");
        await refreshSession(account_id);
    } catch (error) {
        console.error("Leave team error:", error);
    }

    revalidatePath("/dashboard");
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
            if(member.sp_link) member.sp_link = await getSignedUrlForR2(member.sp_link);
        }

        if(data.team.pp_link) data.team.pp_link = await getSignedUrlForR2(data.team.pp_link);

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
    const name = formData.get("name") as string;
    const institution = formData.get("institution") as string;
    const phoneNum = formData.get("phone_num") as string;
    const idNo = formData.get("id_no") as string;

    const scKey = formData.get("sc_key") as string; 
    const sdKey = formData.get("sd_key") as string;
    const fpKey = formData.get("fp_key") as string;
    const spKey = formData.get("sp_key") as string;

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

    revalidatePath("/dashboard/iecom/team");
    return { message: "Your details have been saved successfully." };

  } catch (e) {
    console.error("Update Member Error:", e);
    return { error: "An error occurred while saving your details." };
  }
}

export async function updateBilling(
    prevState: PaymentFormState,
    formData: FormData
): Promise<PaymentFormState> {
    const session = await verifySession();
    if (!session) return { error: "Not authenticated." };
    const { account_id } = session;

    try {
        const paymentProofFile = formData.get("payment_proof_url") as File;

        if (!paymentProofFile || paymentProofFile.size === 0) {
            return { error: "Please select a payment proof file." };
        }

        const ppKey = await uploadFileToR2(paymentProofFile, "team-pp", account_id);

        const team_id = await getTeamId(account_id);
        if (!team_id) return { error: "You are not on a team." };

        await updatePayment(team_id, ppKey);

        revalidatePath("/dashboard/iecom/team");
        return { message: "Payment proof uploaded successfully." };

    } catch{
        return { error: "An error occurred while uploading payment proof." };
    }
}