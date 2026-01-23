"use server";

import { DB, db } from "@/lib/DB";
import { niceTeam, niceMember, iecomTeam, iecomMember } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createAdminSession, logoutAdmin, verifyAdminSession } from "./admin-auth";
import {
  CompetitionType,
  ScalarValue,
  UpdateAction,
  NiceTeamInsert,
  IecomTeamInsert,
  NiceMemberInsert,
  IecomMemberInsert
} from "@/actions/types/Database";
import { getSignedUrlForR2 } from "@/lib/R2";
import { AdminFormState, TeamData } from "../types/Admin";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { iecomProblem, iecomSubmission } from "@/lib/schema";
import { LeaderboardTeam } from "@/actions/types/Admin";

const SCORING_RULES = {
  easy:   { correct: 2, wrong: -0.5 },
  medium: { correct: 3, wrong: -0.75 },
  hard:   { correct: 4, wrong: -1 },
} as const;

// --- Helper: Array Logic for Notes ---
function getArrayUpdate(
  action: UpdateAction,
  currentNotes: string[] | null,
  value: string
): string[] {
  const notes = currentNotes || [];
  if (action === "add_note") return [...notes, value];
  if (action === "remove_note") return notes.filter((n) => n !== value);
  return notes;
}

// --- Team Update Action ---
export async function updateTeamStatus(
  competition: CompetitionType,
  teamId: string,
  field: string,
  value: ScalarValue,
  action: UpdateAction = "update"
) {
  const session = await verifyAdminSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    if (competition === "IECOM") {
      // --- IECOM Logic ---
      
      // 1. Handle Notes
      if (field === "notes" || field === "general_note") {
        const current = await db.query.iecomTeam.findFirst({
          where: eq(iecomTeam.teamId, teamId),
          columns: { notes: true },
        });

        if (!current) return { error: "Team not found" };

        const newNotes = getArrayUpdate(
          action === "update" ? "add_note" : action,
          current.notes,
          String(value)
        );

        await db.update(iecomTeam).set({ notes: newNotes }).where(eq(iecomTeam.teamId, teamId));
      } 
      // 2. Handle Fields
      else {
        const payload: Partial<IecomTeamInsert> = {};

        // Explicit Mapping: Form Field -> Drizzle Schema Key
        if (field === "status") payload.status = Number(value);
        else if (field === "pp_verified") payload.ppVerified = Number(value);

        if (Object.keys(payload).length > 0) {
          await db.update(iecomTeam).set(payload).where(eq(iecomTeam.teamId, teamId));
        }
      }
    } 
    else {
      // --- NICE Logic ---

      // 1. Handle Notes
      if (field === "notes" || field === "general_note") {
        const current = await db.query.niceTeam.findFirst({
          where: eq(niceTeam.teamId, teamId),
          columns: { notes: true },
        });

        if (!current) return { error: "Team not found" };

        const newNotes = getArrayUpdate(
          action === "update" ? "add_note" : action,
          current.notes,
          String(value)
        );

        await db.update(niceTeam).set({ notes: newNotes }).where(eq(niceTeam.teamId, teamId));
      } 
      // 2. Handle Fields
      else {
        const payload: Partial<NiceTeamInsert> = {};

        // Explicit Mapping: Form Field -> Drizzle Schema Key
        if (field === "status") payload.status = Number(value);
        else if (field === "submission_status") payload.submissionStatus = Number(value);
        else if (field === "payment_verified") payload.paymentVerified = Number(value);
        else if (field === "proposal_verified") payload.proposalVerified = Number(value);

        if (Object.keys(payload).length > 0) {
          await db.update(niceTeam).set(payload).where(eq(niceTeam.teamId, teamId));
        }
      }
    }

    revalidatePath("/admin/dashboard");
    return { success: true, message: "Team Updated" };
  } catch (e) {
    console.error("Update team error:", e);
    return { error: "Failed to update team" };
  }
}

// --- Member Update Action ---
export async function updateMemberStatus(
  competition: CompetitionType,
  teamId: string,
  accountId: string,
  field: string,
  value: ScalarValue,
  action: UpdateAction = "update"
) {
  const session = await verifyAdminSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const numericVal = Number(value);

    // To avoid 'any', we branch logic based on competition.
    // This allows TypeScript to infer the exact Partial<InsertModel> for .set()
    
    if (competition === "IECOM") {
      const whereClause = and(eq(iecomMember.teamId, teamId), eq(iecomMember.accountId, accountId));

      if (field === "notes" || field === "general_note") {
        const current = await db.query.iecomMember.findFirst({
          where: whereClause,
          columns: { notes: true },
        });

        if (!current) return { error: "Member not found" };

        const newNotes = getArrayUpdate(
          action === "update" ? "add_note" : action,
          current.notes,
          String(value)
        );

        await db.update(iecomMember).set({ notes: newNotes }).where(whereClause);
      } else {
        const payload: Partial<IecomMemberInsert> = {};

        // Strict Mapping
        if (field === "status") payload.status = numericVal;
        else if (field === "sc_verified") payload.scVerified = numericVal;
        else if (field === "fp_verified") payload.fpVerified = numericVal;
        else if (field === "sd_verified") payload.sdVerified = numericVal;
        else if (field === "sp_verified") payload.spVerified = numericVal;

        if (Object.keys(payload).length > 0) {
          await db.update(iecomMember).set(payload).where(whereClause);
        }
      }
    } 
    else {
      // NICE COMPETITION
      const whereClause = and(eq(niceMember.teamId, teamId), eq(niceMember.accountId, accountId));

      if (field === "notes" || field === "general_note") {
        const current = await db.query.niceMember.findFirst({
          where: whereClause,
          columns: { notes: true },
        });

        if (!current) return { error: "Member not found" };

        const newNotes = getArrayUpdate(
          action === "update" ? "add_note" : action,
          current.notes,
          String(value)
        );

        await db.update(niceMember).set({ notes: newNotes }).where(whereClause);
      } else {
        const payload: Partial<NiceMemberInsert> = {};

        // Strict Mapping
        if (field === "status") payload.status = numericVal;
        else if (field === "sc_verified") payload.scVerified = numericVal;
        else if (field === "fp_verified") payload.fpVerified = numericVal;
        else if (field === "sd_verified") payload.sdVerified = numericVal;
        else if (field === "sp_verified") payload.spVerified = numericVal;

        if (Object.keys(payload).length > 0) {
          await db.update(niceMember).set(payload).where(whereClause);
        }
      }
    }

    revalidatePath("/admin/dashboard");
    return { success: true, message: "Member updated" };
  } catch (e) {
    console.error("Member update error:", e);
    return { error: "Failed to update member" };
  }
}

export async function getSignedDocUrl(key: string | null) {
  const session = await verifyAdminSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

  if (!key) return { error: "No key provided" };

  const url = await getSignedUrlForR2(key);
  
  if (!url) return { error: "Failed to sign URL" };

  return { success: true, url };
}

export async function getAdminDashboardData() {
  const session = await verifyAdminSession();
  if (!session) throw new Error("Unauthorized");

  // 1. Fetch NICE Teams
  // We map snake_case columns to camelCase keys directly in the SQL for performance
  const niceResult = await db.execute(sql`
    SELECT 
      t.team_id as "teamId", 
      t.name, 
      t.code, 
      t.status,
      t.notes,
      t.submission_status as "submissionStatus", 
      t.bmc_link as "bmcLink", 
      t.poo_link as "pooLink", 
      t.proposal_link as "proposalLink", 
      t.payment_proof_link as "paymentProofLink", 
      t.payment_verified as "paymentVerified", 
      t.proposal_verified as "proposalVerified",
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.account_id, 
            'name', m.name, 
            'role', m.role, 
            'email', m.email, 
            'phoneNum', m.phone_num,
            'institution', m.institution,
            'idNo', m.id_no,
            'notes', m.notes, 
            'status', m.status,
            'scVerified', m.sc_verified, 'scLink', m.sc_link,
            'fpVerified', m.fp_verified, 'fpLink', m.fp_link,
            'sdVerified', m.sd_verified, 'sdLink', m.sd_link,
            'spVerified', m.sp_verified, 'spLink', m.sp_link
          ) ORDER BY m.name ASC
        ) FILTER (WHERE m.account_id IS NOT NULL), '[]'
      ) as members
    FROM nice_team t
    LEFT JOIN nice_member m ON t.team_id = m.team_id
    GROUP BY t.team_id 
    ORDER BY t.name ASC
  `);

  // 2. Fetch IECOM Teams
  const iecomResult = await db.execute(sql`
    SELECT 
      t.team_id as "teamId", 
      t.name, 
      t.code, 
      t.status, 
      t.notes,
      t.pp_verified as "ppVerified", 
      t.pp_link as "paymentProofLink", 
      t.initial_draft_link as "initialDraftLink", 
      t.final_report_link as "finalReportLink", 
      t.video_link as "videoLink", 
      t.infographic_link as "infographicLink",
      COALESCE(
        json_agg(
          json_build_object(
            'id', m.account_id, 
            'name', m.name, 
            'role', m.role, 
            'email', m.email, 
            'phoneNum', m.phone_num,
            'institution', m.institution,
            'idNo', m.id_no,
            'notes', m.notes, 
            'status', m.status,
            'scVerified', m.sc_verified, 'scLink', m.sc_link,
            'fpVerified', m.fp_verified, 'fpLink', m.fp_link,
            'sdVerified', m.sd_verified, 'sdLink', m.sd_link,
            'spVerified', m.sp_verified, 'spLink', m.sp_link
          ) ORDER BY m.name ASC
        ) FILTER (WHERE m.account_id IS NOT NULL), '[]'
      ) as members
    FROM iecom_team t
    LEFT JOIN iecom_member m ON t.team_id = m.team_id
    GROUP BY t.team_id 
    ORDER BY t.name ASC
  `);

  // 3. Return typed data
  // The 'rows' property contains the raw array of objects from the driver
  return { 
    niceTeams: niceResult.rows as unknown as TeamData[], 
    iecomTeams: iecomResult.rows as unknown as TeamData[], 
    role: session.role, 
    username: session.username 
  };
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

export async function getIecomLeaderboard(): Promise<LeaderboardTeam[]> {
  const session = await verifyAdminSession();
  if (!session) return [];

  // 1. Fetch All Necessary Data
  // We use db.select() to get raw data for calculation
  const [problems, submissions, members, teams] = await Promise.all([
    db.select().from(iecomProblem),
    db.select().from(iecomSubmission),
    db.select().from(iecomMember),
    db.select().from(iecomTeam),
  ]);

  // 2. Build Helper Maps
  
  // Map: ProblemID -> { CorrectAnswerID, Difficulty }
  const problemMap = new Map<number, { correctId: string; difficulty: 'easy' | 'medium' | 'hard' }>();
  problems.forEach(p => {
    const options = p.options as { id: string }[]; 
    problemMap.set(p.id, { 
      correctId: options[0].id, 
      difficulty: p.difficulty as 'easy' | 'medium' | 'hard' 
    });
  });

  // Map: MemberID -> Stats
  type MemberStats = { name: string; teamId: string; score: number };
  const memberStatsMap = new Map<string, MemberStats>();

  members.forEach(m => {
    memberStatsMap.set(m.accountId, {
      name: m.name || m.email,
      teamId: m.teamId,
      score: 0
    });
  });

  // 3. Calculate Scores
  for (const sub of submissions) {
    if (!sub.problemId) continue;
    
    const problemInfo = problemMap.get(sub.problemId);
    const memberStats = memberStatsMap.get(sub.memberAccountId);

    if (!problemInfo || !memberStats) continue;

    const isCorrect = sub.selectedOptionId === problemInfo.correctId;
    const { correct, wrong } = SCORING_RULES[problemInfo.difficulty];
    const points = isCorrect ? correct : wrong;

    memberStats.score += points;
  }

  // 4. Aggregate into Teams
  const teamResultsMap = new Map<string, LeaderboardTeam>();

  // Initialize all teams with 0
  teams.forEach(t => {
    teamResultsMap.set(t.teamId, {
      teamId: t.teamId,
      teamName: t.name,
      totalScore: 0,
      rank: 0, // Will set later
      members: []
    });
  });

  // Populate scores
  memberStatsMap.forEach((stats) => {
    const team = teamResultsMap.get(stats.teamId);
    if (team) {
      team.members.push({ name: stats.name, score: stats.score });
      team.totalScore += stats.score;
    }
  });

  // 5. Sort and Rank
  const leaderboard = Array.from(teamResultsMap.values())
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((team, index) => ({
      ...team,
      rank: index + 1,
      // Sort members by contribution score for the detailed view
      members: team.members.sort((a, b) => b.score - a.score)
    }));

  return leaderboard;
}