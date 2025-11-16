import { DB } from "@/lib/DB";
import { Member, TeamIECOM } from "../types/Competition";

export async function checkTeamNameExists(teamName: string): Promise<boolean> {
    const result = await DB`
        SELECT 1 FROM iecom_team 
        WHERE name ILIKE ${teamName}
    `;
    return result.length > 0;
}

export async function insertNewTeam(
    teamName: string,
    newCode: string,
    accountId: string,
    email: string,
) {
    const result = await DB`
        WITH new_team AS (
            INSERT INTO iecom_team (name, code) 
            VALUES (${teamName}, ${newCode}) 
            RETURNING team_id
        )
        INSERT INTO iecom_member (team_id, account_id, email, role)
        SELECT team_id, ${accountId}, ${email}, 'LEADER'
        FROM new_team
        RETURNING team_id
    `;

    if (result.length === 0) throw new Error("Failed to create team record");
}

export async function addMemberToTeam(teamId: string, accountId: string, email: string) {
    const result = await DB`
        INSERT INTO iecom_member (team_id, account_id, email, role)
        SELECT ${teamId}, ${accountId}, ${email}, 'MEMBER'
        WHERE (
            SELECT count FROM iecom_team WHERE team_id = ${teamId}
        ) < 3
        RETURNING account_id
    `;

    if (result.length === 0) {
        throw new Error("TEAM_FULL");
    }
}

export async function deleteMember(accountId: string) {
    await DB`
        DELETE FROM iecom_member 
        WHERE account_id = ${accountId}
    `;
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

    const membersResult = await (DB`
        SELECT 
            account_id, email, name, institution, phone_num, 
            id_no, sc_link, sc_verified, sd_link, sd_verified, 
            fp_link, fp_verified, sp_link, sp_verified, status, notes
        FROM iecom_member 
        WHERE team_id = ${teamId}
    `) as Member[];

    return {
        team: teamResult[0],
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
    await DB`
        UPDATE iecom_team 
        SET 
            pp_link = COALESCE(${ppKey}::text, pp_link),
            pp_verified = CASE WHEN ${ppKey}::text IS NOT NULL THEN 0 ELSE pp_verified END
        WHERE team_id = ${teamId}
    `;
}