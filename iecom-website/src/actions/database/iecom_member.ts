import { DB } from "@/lib/DB";

export async function updateMember(
  accountId: string,
  name: string,
  institution: string,
  phoneNum: string,
  idNo: string,
  scKey: string | null,
  sdKey: string | null,
  fpKey: string | null,
  spKey: string | null
) {
  await DB`
    UPDATE iecom_member
    SET
      name = ${name},
      institution = ${institution},
      phone_num = ${phoneNum},
      id_no = ${idNo},
      
      sc_link = COALESCE(${scKey}::text, sc_link),
      sc_verified = CASE WHEN ${scKey}::text IS NOT NULL THEN 0 ELSE sc_verified END,

      sd_link = COALESCE(${sdKey}::text, sd_link),
      sd_verified = CASE WHEN ${sdKey}::text IS NOT NULL THEN 0 ELSE sd_verified END,

      fp_link = COALESCE(${fpKey}::text, fp_link),
      fp_verified = CASE WHEN ${fpKey}::text IS NOT NULL THEN 0 ELSE fp_verified END,

      sp_link = COALESCE(${spKey}::text, sp_link),
      sp_verified = CASE WHEN ${spKey}::text IS NOT NULL THEN 0 ELSE sp_verified END
      
    WHERE account_id = ${accountId}
  `;
}