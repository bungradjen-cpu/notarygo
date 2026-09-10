"use server";

import { createClient } from "@/utils/supabase/server";
import { DocumentService } from "@/lib/operations/DocumentService";
import { revalidatePath } from "next/cache";

export async function uploadDocumentAction(matterId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const documentId = formData.get("documentId") as string; // Optional (for new version)
  const title = formData.get("title") as string; // Optional (for new doc)
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file provided");

  await DocumentService.uploadDocumentVersion(orgId, matterId, documentId, file, user.id, title);

  revalidatePath(`/dashboard/matters/${matterId}/documents`);
}

export async function getSignedDownloadUrl(filePath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  return await DocumentService.getSignedUrl(filePath, 300); // 5 minutes
}
