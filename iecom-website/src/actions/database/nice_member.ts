import { DB } from "@/lib/DB";

export async function updateMember(
  accountId: string,
  name: string,
  institution: string,
  phoneNum: string,
  idNo: string,
  scKey: string | null,
  sdKey: string | null,
  fpKey: string | null
) {
  let updateQuery = DB`
    UPDATE nice_member
    SET
      name = ${name},
      institution = ${institution},
      phone_num = ${phoneNum},
      id_no = ${idNo}
  `;

  if (scKey) {
    updateQuery = DB`${updateQuery}, sc_link = ${scKey}, sc_verified = 0`;
  }
  
  if (sdKey) {
    updateQuery = DB`${updateQuery}, sd_link = ${sdKey}, sd_verified = 0`;
  }

  if (fpKey) {
    updateQuery = DB`${updateQuery}, fp_link = ${fpKey}, fp_verified = 0`;
  }

  await DB`${updateQuery} WHERE account_id = ${accountId}`;
}