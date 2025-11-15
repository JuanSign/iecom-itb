import { DB } from "@/lib/DB";

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