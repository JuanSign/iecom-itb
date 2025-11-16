import { z } from 'zod';

export type AuthState = {
  success: boolean;
  error?: string;      
  message?: string;    
} | undefined;

export const AuthSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});