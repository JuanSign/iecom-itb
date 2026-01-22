"use server";

import { DB } from "@/lib/DB";
import { verifyAdminSession, createAdminSession, logoutAdmin } from "@/actions/server/admin-auth";
import { getSignedUrlForR2 } from "@/lib/R2";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AdminFormState = {
  error?: string;
  message?: string;
};

export interface DashboardMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone_num: string;
  institution: string | null;
  id_no: string | null;
  sc_verified: number;
  sc_link: string | null;
  fp_verified: number;
  fp_link: string | null;
  sd_verified: number;
  sd_link: string | null;
  sp_verified: number;
  sp_link: string | null;
  notes: string[] | null;
  status: number;
}

export interface DashboardTeam {
  team_id: number;
  team_name: string;
  code: string;
  notes: string[] | null;
  status: number;
  members: DashboardMember[];
  pp_verified?: number;
  pp_link?: string | null;
  initial_draft_link?: string | null;
  final_report_link?: string | null;
  video_link?: string | null;
  infographic_link?: string | null;
  submission_status?: number;
  bmc_link?: string | null;
  poo_link?: string | null;
  payment_verified?: number;
  payment_proof_link?: string | null;
  proposal_verified?: number;
  proposal_link?: string | null;
}

export async function adminLogin(prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    const admin = await DB`SELECT * FROM admin_users WHERE username = ${username}`;

    if (admin.length === 0) return { error: "Invalid credentials" };

    const isValid = await bcrypt.compare(password, admin[0].password_hash);
    if (!isValid) return { error: "Invalid credentials" };

    await createAdminSession(admin[0].username, admin[0].role);
  } catch (e) {
    console.error("Login error:", e);
    return { error: "Database error during login" };
  }
  
  redirect("/admin/dashboard");
}

export async function adminLogout() {
  await logoutAdmin();
  redirect("/admin");
}

export async function getAdminDashboardData() {
  const session = await verifyAdminSession();
  if (!session) throw new Error("Unauthorized");

  const niceRaw = await DB`
    SELECT 
      t.team_id, t.name as team_name, t.code, t.submission_status, 
      t.bmc_link, t.poo_link, t.notes, t.status,
      t.payment_proof_link, t.proposal_link, t.payment_verified, t.proposal_verified,
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.account_id, 
            'name', m.name, 
            'role', m.role, 
            'email', m.email, 
            'phone_num', m.phone_num,
            'institution', m.institution,
            'id_no', m.id_no,
            'sc_verified', m.sc_verified, 'sc_link', m.sc_link,
            'fp_verified', m.fp_verified, 'fp_link', m.fp_link,
            'sd_verified', m.sd_verified, 'sd_link', m.sd_link,
            'sp_verified', m.sp_verified, 'sp_link', m.sp_link,
            'notes', m.notes, 'status', m.status
          ) ORDER BY m.name ASC
        ) FILTER (WHERE m.account_id IS NOT NULL), '[]'
      ) as members
    FROM nice_team t
    LEFT JOIN nice_member m ON t.team_id = m.team_id
    GROUP BY t.team_id ORDER BY t.name ASC
  `;

  const iecomRaw = await DB`
    SELECT 
      t.team_id, t.name as team_name, t.code, t.pp_verified, t.pp_link, 
      t.initial_draft_link, t.final_report_link, t.video_link, t.infographic_link,
      t.notes, t.status,
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.account_id, 
            'name', m.name, 
            'role', m.role, 
            'email', m.email, 
            'phone_num', m.phone_num,
            'institution', m.institution,
            'id_no', m.id_no,
            'sc_verified', m.sc_verified, 'sc_link', m.sc_link,
            'fp_verified', m.fp_verified, 'fp_link', m.fp_link,
            'sd_verified', m.sd_verified, 'sd_link', m.sd_link,
            'sp_verified', m.sp_verified, 'sp_link', m.sp_link,
            'notes', m.notes, 'status', m.status
          ) ORDER BY m.name ASC
        ) FILTER (WHERE m.account_id IS NOT NULL), '[]'
      ) as members
    FROM iecom_team t
    LEFT JOIN iecom_member m ON t.team_id = m.team_id
    GROUP BY t.team_id ORDER BY t.name ASC
  `;

  return { 
    niceTeams: niceRaw as unknown as DashboardTeam[], 
    iecomTeams: iecomRaw as unknown as DashboardTeam[], 
    role: session.role, 
    username: session.username 
  };
}

export async function getSignedDocUrl(key: string) {
    const session = await verifyAdminSession();
    if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

    if (!key) return { error: "No key provided" };

    const url = await getSignedUrlForR2(key);
    if (!url) return { error: "Failed to sign URL" };

    return { success: true, url };
}

export async function updateTeamStatus(
  competition: "NICE" | "IECOM",
  teamId: number,
  field: string,
  value: number | string,
  action?: "update" | "remove_note"
) {
  const session = await verifyAdminSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    if (competition === "IECOM") {
        if (field === "notes" && action === "remove_note") {
            await DB`UPDATE iecom_team SET notes = array_remove(notes, ${String(value)}) WHERE team_id = ${teamId}`;
        }
        else if (field === "general_note") {
            await DB`UPDATE iecom_team SET notes = array_append(notes, ${String(value)}) WHERE team_id = ${teamId}`;
        }
        else if (field === "status") {
            await DB`UPDATE iecom_team SET status = ${Number(value)} WHERE team_id = ${teamId}`;
        }
        else if (field === "pp_verified") {
            await DB`UPDATE iecom_team SET pp_verified = ${Number(value)} WHERE team_id = ${teamId}`;
        }
        else {
            return { error: "Invalid field for IECOM" };
        }
    }
    else if (competition === "NICE") {
        if (field === "notes" && action === "remove_note") {
            await DB`UPDATE nice_team SET notes = array_remove(notes, ${String(value)}) WHERE team_id = ${teamId}`;
        }
        else if (field === "general_note") {
            await DB`UPDATE nice_team SET notes = array_append(notes, ${String(value)}) WHERE team_id = ${teamId}`;
        }
        else if (field === "status") {
            await DB`UPDATE nice_team SET status = ${Number(value)} WHERE team_id = ${teamId}`;
        }
        else if (field === "submission_status") {
            await DB`UPDATE nice_team SET submission_status = ${Number(value)} WHERE team_id = ${teamId}`;
        }
        else {
            return { error: "Invalid field for NICE" };
        }
    }

    revalidatePath("/admin/dashboard");
    return { success: true, message: "Team Updated" };

  } catch (e) {
    console.error("Update team error:", e);
    return { error: "Failed to update team" };
  }
}

export async function updateMemberStatus(
  competition: "NICE" | "IECOM",
  teamId: string,
  accountId: string,
  field: string,
  value: number | string,
  action?: "update" | "remove_note"
) {
  const session = await verifyAdminSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    if (competition === "IECOM") {
        if (field === "notes" && action === "remove_note") {
             await DB`UPDATE iecom_member SET notes = array_remove(notes, ${String(value)}) WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "general_note") {
             await DB`UPDATE iecom_member SET notes = array_append(notes, ${String(value)}) WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "status") {
             await DB`UPDATE iecom_member SET status = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "sc_verified") {
             await DB`UPDATE iecom_member SET sc_verified = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "fp_verified") {
             await DB`UPDATE iecom_member SET fp_verified = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "sd_verified") {
             await DB`UPDATE iecom_member SET sd_verified = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "sp_verified") {
             await DB`UPDATE iecom_member SET sp_verified = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else {
            return { error: "Invalid field for IECOM Member" };
        }
    }
    else if (competition === "NICE") {
        if (field === "notes" && action === "remove_note") {
             await DB`UPDATE nice_member SET notes = array_remove(notes, ${String(value)}) WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "general_note") {
             await DB`UPDATE nice_member SET notes = array_append(notes, ${String(value)}) WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "status") {
             await DB`UPDATE nice_member SET status = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "sc_verified") {
             await DB`UPDATE nice_member SET sc_verified = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "fp_verified") {
             await DB`UPDATE nice_member SET fp_verified = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "sd_verified") {
             await DB`UPDATE nice_member SET sd_verified = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else if (field === "sp_verified") {
             await DB`UPDATE nice_member SET sp_verified = ${Number(value)} WHERE team_id = ${teamId} AND account_id = ${accountId}`;
        }
        else {
            return { error: "Invalid field for NICE Member" };
        }
    }

    revalidatePath("/admin/dashboard");
    return { success: true, message: "Member updated" };

  } catch (e) {
    console.error("Member update error:", e);
    return { error: "Failed to update member" };
  }
}