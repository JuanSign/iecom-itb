import { DB } from "@/lib/DB";
import { Member, TeamNICE } from "../types/Competition";

export async function insertNewTeam(
    teamName: string,
    newCode: string,
    accountId: string,
    email: string,
) {
    const newTeam = await DB`
        INSERT INTO nice_team (name, code) 
        VALUES (${teamName}, ${newCode}) 
        RETURNING team_id
    `;

    if (!newTeam || newTeam.length === 0) throw new Error("Failed to create team record");
    const teamId = newTeam[0].team_id;

    await DB`
        INSERT INTO nice_member (team_id, account_id, email, role)
        VALUES (${teamId}, ${accountId}, ${email}, 'LEADER')
    `;
}

export async function addMemberToTeam(teamId: string, accountId: string) {
    await DB`
        INSERT INTO nice_member (team_id, account_id, role)
        VALUES (${teamId}, ${accountId}, MEMBER')
    `;
}

export async function deleteMember(accountId: string) {
  await DB`DELETE FROM nice_member WHERE account_id = ${accountId}`;
}

export async function fetchTeamPageData(accountId: string) {
  const teamMembership = await DB`SELECT team_id FROM nice_member WHERE account_id = ${accountId}`;
  if (teamMembership.length === 0) {
    throw new Error("User not assigned to a team.");
  }

  const teamId = teamMembership[0].team_id;

  const teamResult = await (DB`
    SELECT 
      team_id, name, code, status, messages, 
      notes, bmc_link, poo_link, submission_status
    FROM nice_team 
    WHERE team_id = ${teamId}
  `) as TeamNICE[];

  const team = teamResult[0];

  const membersResult = await (DB`
    SELECT 
      account_id, email, name, institution, phone_num, 
      id_no, sc_link, sc_verified, sd_link, sd_verified, 
      fp_link, fp_verified, status, notes
    FROM nice_member 
    WHERE team_id = ${teamId}
  `) as Member[];

  return {
    team,
    members: membersResult,
    currentUserAccountId: accountId,
  };
}

export async function getTeamId(accountId: string) {
  const teamResult = await DB`SELECT team_id FROM nice_member WHERE account_id = ${accountId}`;
  return teamResult.length > 0 ? teamResult[0].team_id : null;
}

export async function updateTeamDocsInDb(teamId: string, bmcKey: string | null, pooKey: string | null) {
  await DB`
    UPDATE nice_team
    SET 
      bmc_link = COALESCE(${bmcKey}, bmc_link),
      poo_link = COALESCE(${pooKey}, poo_link),
      submission_status = 1
    WHERE team_id = ${teamId}
  `;
}