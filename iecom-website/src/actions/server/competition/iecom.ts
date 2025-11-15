"use server"

import { CreateTeamFormState, createTeamSchema, JoinTeamFormState, joinTeamSchema, PaymentFormState, UpdateMemberFormState } from "@/actions/types/Competition";
import { refreshSession, verifySession } from "../session";
import { DB } from "@/lib/DB";
import { addMemberToTeam, deleteMember, fetchTeamPageData, getTeamId, insertNewTeam, updatePayment } from "@/actions/database/iecom_team";
import { addEventToAccount, removeEventFromAccount } from "@/actions/database/account";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSignedUrlForR2, uploadFileToR2 } from "@/lib/R2";
import { updateMember } from "@/actions/database/iecom_member";

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

    const validatedFields = joinTeamSchema.safeParse({
        teamCode: formData.get("teamCode"),
    });

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues.map((e) => e.message).join(", ") };
    }

    const { teamCode } = validatedFields.data;
    const { account_id, email } = session;

    try {
        const team = await DB`SELECT team_id, count FROM iecom_team WHERE code = ${teamCode}`;
        if (team.length === 0) return { error: "Invalid team code." };

        const teamId = team[0].team_id;
        const count = team[0].count;

        if (count >= 3) {
            return { error: "This team has reached the maximum of 3 members." };
        }

        await addMemberToTeam(teamId, account_id, email);
        await addEventToAccount(account_id, "IECOM");
        await refreshSession(account_id);

    } catch(e){
        console.error("Join team error:", e);
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
      member.sc_link = await getSignedUrlForR2(member.sc_link);
      member.sd_link = await getSignedUrlForR2(member.sc_link);
      member.fp_link = await getSignedUrlForR2(member.fp_link);
    }

    // Generate Signed URLs for team documents
    data.team.pp_link = await getSignedUrlForR2(data.team.pp_link);

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
    // 1. Extract Text Fields
    const name = formData.get("name") as string;
    const institution = formData.get("institution") as string;
    const phoneNum = formData.get("phone_num") as string;
    const idNo = formData.get("id_no") as string;

    // 2. Extract Files
    const scFile = formData.get("sc_link") as File; // Student Card
    const sdFile = formData.get("sd_link") as File; // Student Document/Data
    const fpFile = formData.get("fp_link") as File; // Formal Photo

    // 3. Handle File Uploads Conditionally
    // We only upload if a file exists and has size (user selected a new one)
    let scKey: string | null = null;
    let sdKey: string | null = null;
    let fpKey: string | null = null;

    if (scFile && scFile.size > 0) {
      scKey = await uploadFileToR2(scFile, "member-sc", account_id);
    }

    if (sdFile && sdFile.size > 0) {
      // Assuming 'member-sd' is the folder/prefix for this new doc type
      sdKey = await uploadFileToR2(sdFile, "member-sd", account_id);
    }

    if (fpFile && fpFile.size > 0) {
      fpKey = await uploadFileToR2(fpFile, "member-fp", account_id);
    }

    // 4. Update Database
    await updateMember(
      account_id,
      name,
      institution,
      phoneNum,
      idNo,
      scKey,
      sdKey,
      fpKey
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