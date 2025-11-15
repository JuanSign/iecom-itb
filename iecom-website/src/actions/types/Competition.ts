import { z } from 'zod';

export type CreateTeamFormState = { error?: string; };
export type JoinTeamFormState = { error?: string; };

export const createTeamSchema = z.object({
  teamName: z.string().min(3, "Team name must be at least 3 characters"),
});

export const joinTeamSchema = z.object({
  teamCode: z.string().regex(/^[A-Z]{5}$/, "Code must be 5 uppercase letters."),
});

export type Member = {
  account_id: string, 
  email: string, 
  name: string | null,
  institution: string | null,
  phone_num: string | null,
  id_no: string | null,
  sc_link: string | null,
  sc_verified: number,
  sd_link: string | null, 
  sd_verified: number,
  fp_link: string | null,
  fp_verified: number,
  status: number,
  notes: string[] | null,
}

export type TeamIECOM = {
  team_id: string,
  name: string, 
  code: string,
  status: number,
  messages: string[] | null,
  notes: string[] | null,
  pp_link: string | null,
  pp_verified: number
}

export type UpdateMemberFormState = {
  error?: string;
  message?: string;
};

export type PaymentFormState = {
  error?: string;
  message?: string;
}