import {z} from 'zod'

export type AuthState = {
  success: boolean;
  error?: string;
  message?: string;
  inputs?: {
    email?: string;
  };
} | undefined;

export const AuthSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});