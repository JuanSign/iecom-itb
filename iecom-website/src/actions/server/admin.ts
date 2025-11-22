"use server";

import { DB } from "@/lib/DB";
import { verifyAdminSession, createAdminSession, logoutAdmin } from "@/actions/server/admin-auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// --- TYPES ---

export type AdminFormState = {
  error?: string;
  message?: string;
};

// --- AUTHENTICATION ---

export async function adminLogin(prevState: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    const admin = await DB`SELECT * FROM admin_users WHERE username = ${username}`;

    if (admin.length === 0) {
      return { error: "Invalid credentials" };
    }

    const isValid = await bcrypt.compare(password, admin[0].password_hash);
    if (!isValid) {
      return { error: "Invalid credentials" };
    }

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

// --- DATA FETCHING ---

export async function getAdminDashboardData() {
  const session = await verifyAdminSession();
  if (!session) throw new Error("Unauthorized");

  // 1. Fetch NICE Teams (Has submission_status, bmc_link, poo_link)
  const niceTeams = await DB`
    SELECT 
      t.team_id,
      t.name as team_name,
      t.code,
      t.submission_status,
      t.bmc_link,
      t.poo_link,
      t.notes,
      t.status,
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.account_id,
            'name', m.name,
            'email', m.email,
            'phone_num', m.phone_num,
            'sc_verified', m.sc_verified,
            'sc_link', m.sc_link,
            'fp_verified', m.fp_verified,
            'fp_link', m.fp_link
          )
        ) FILTER (WHERE m.account_id IS NOT NULL), 
        '[]'
      ) as members
    FROM nice_team t
    LEFT JOIN nice_member m ON t.team_id = m.team_id
    GROUP BY t.team_id
    ORDER BY t.name ASC
  `;

  // 2. Fetch IECOM Teams (Has pp_verified, pp_link)
  const iecomTeams = await DB`
    SELECT 
      t.team_id,
      t.name as team_name,
      t.code,
      t.pp_verified,
      t.pp_link,
      t.notes,
      t.status,
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.account_id,
            'name', m.name,
            'email', m.email,
            'phone_num', m.phone_num,
            'sc_verified', m.sc_verified,
            'sc_link', m.sc_link,
            'fp_verified', m.fp_verified,
            'fp_link', m.fp_link
          )
        ) FILTER (WHERE m.account_id IS NOT NULL), 
        '[]'
      ) as members
    FROM iecom_team t
    LEFT JOIN iecom_member m ON t.team_id = m.team_id
    GROUP BY t.team_id
    ORDER BY t.name ASC
  `;

  return { niceTeams, iecomTeams, role: session.role, username: session.username };
}

// --- MUTATIONS ---

export async function updateTeamStatus(
  competition: "NICE" | "IECOM",
  teamId: number,
  field: string,
  value: number,
  note?: string
) {
  const session = await verifyAdminSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized or Insufficient Permissions" };

  // Allowed fields check
  const allowedFields = ["pp_verified", "submission_status"];
  if (!allowedFields.includes(field)) {
    return { error: "Invalid field update request" };
  }

  try {
    if (competition === "NICE") {
      // NICE Only has 'submission_status'
      if (field === "submission_status") {
        if (note) {
          await DB`
            UPDATE nice_team 
            SET submission_status = ${value}, notes = array_append(notes, ${note}) 
            WHERE team_id = ${teamId}
          `;
        } else {
          await DB`
            UPDATE nice_team 
            SET submission_status = ${value} 
            WHERE team_id = ${teamId}
          `;
        }
        revalidatePath("/admin/dashboard");
        return { success: true, message: "NICE Team updated" };
      } 
      else {
        return { error: `Field '${field}' does not exist on NICE teams` };
      }

    } else {
      // IECOM Only has 'pp_verified'
      if (field === "pp_verified") {
        if (note) {
          await DB`
            UPDATE iecom_team 
            SET pp_verified = ${value}, notes = array_append(notes, ${note}) 
            WHERE team_id = ${teamId}
          `;
        } else {
          await DB`
            UPDATE iecom_team 
            SET pp_verified = ${value} 
            WHERE team_id = ${teamId}
          `;
        }
        revalidatePath("/admin/dashboard");
        return { success: true, message: "IECOM Team updated" };
      } 
      else {
        return { error: `Field '${field}' does not exist on IECOM teams` };
      }
    }

  } catch (e) {
    console.error("Update status error:", e);
    return { error: "Failed to update team" };
  }
}