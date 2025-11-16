"use server";

import { uploadFileToR2 } from "@/lib/R2";
import { verifySession } from "./session";

export async function uploadSingleFile(formData: FormData, folder: string) {
  const session = await verifySession();
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  if (file.size > 1024 * 1024) {
    throw new Error(`File ${file.name} exceeds the 1MB limit.`);
  }

  try {
    const key = await uploadFileToR2(file, folder, session.account_id);
    return { success: true, key };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Upload failed" };
  }
}