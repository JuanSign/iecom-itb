import { DB } from "@/lib/DB";
import { Member, TeamIECOM } from "../types/Competition";

export async function checkTeamNameExists(teamName: string): Promise<boolean> {
    // usage of ILIKE (postgres) for case-insensitive check. 
    // If using MySQL, usually default search is case-insensitive.
    const result = await DB`
        SELECT 1 FROM iecom_team 
        WHERE LOWER(name) = LOWER(${teamName})
    `;
    return result.length > 0;
}

export async function insertNewTeam(
    teamName: string,
    newCode: string,
    accountId: string,
    email: string,
) {
    const newTeam = await DB`
        INSERT INTO iecom_team (name, code) 
        VALUES (${teamName}, ${newCode}) 
        RETURNING team_id
    `;

    if (!newTeam || newTeam.length === 0) throw new Error("Failed to create team record");
    const teamId = newTeam[0].team_id;

    await DB`
        INSERT INTO iecom_member (team_id, account_id, email, role)
        VALUES (${teamId}, ${accountId}, ${email}, 'LEADER')
    `;
}

export async function addMemberToTeam(teamId: string, accountId: string, email: string) {
    await DB`
        INSERT INTO iecom_member (team_id, account_id, email, role)
        VALUES (${teamId}, ${accountId}, ${email}, 'MEMBER')
    `;
}

export async function deleteMember(accountId: string) {
  await DB`DELETE FROM iecom_member WHERE account_id = ${accountId}`;
}

export async function fetchTeamPageData(accountId: string) {
  const teamMembership = await DB`SELECT team_id FROM iecom_member WHERE account_id = ${accountId}`;
  if (teamMembership.length === 0) {
    throw new Error("User not assigned to a team.");
  }

  const teamId = teamMembership[0].team_id;

  const teamResult = await (DB`
    SELECT 
      team_id, name, code, status, messages, 
      notes, pp_link, pp_verified
    FROM iecom_team 
    WHERE team_id = ${teamId}
  `) as TeamIECOM[];

  const team = teamResult[0];

  const membersResult = await (DB`
    SELECT 
      account_id, email, name, institution, phone_num, 
      id_no, sc_link, sc_verified, sd_link, sd_verified, 
      fp_link, fp_verified, status, notes
    FROM iecom_member 
    WHERE team_id = ${teamId}
  `) as Member[];

  return {
    team,
    members: membersResult,
    currentUserAccountId: accountId,
  };
}

export async function getTeamId(accountId: string) {
  const teamResult = await DB`SELECT team_id FROM iecom_member WHERE account_id = ${accountId}`;
  return teamResult.length > 0 ? teamResult[0].team_id : null;
}

export async function updatePayment(
  teamId: string,
  ppKey: string | null
) {
  let updateQuery = DB`UPDATE iecom_team SET `;

  const updates: string[] = [];

  if (ppKey) {
    updates.push(`pp_link = ${ppKey}, pp_verified = 0`);
  } else {
    updates.push(`pp_link = COALESCE(null, pp_link)`);
  }

  updateQuery = DB`${updateQuery} ${updates.join(", ")} WHERE team_id = ${teamId}`;

  await DB`${updateQuery}`;
}
