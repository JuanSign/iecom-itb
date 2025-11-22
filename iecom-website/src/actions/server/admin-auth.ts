import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(process.env.ADMIN_SECRET_KEY || "super-secret-admin-key");

export async function createAdminSession(username: string, role: string) {
  const token = await new SignJWT({ username, role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(SECRET_KEY);

  (await cookies()).set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function verifyAdminSession() {
  const cookie = (await cookies()).get("admin_session")?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, SECRET_KEY);
    return payload as { username: string; role: "ADMIN" | "VIEWER" };
  } catch {
    return null;
  }
}

export async function logoutAdmin() {
  (await cookies()).delete("admin_session");
}