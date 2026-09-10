"use server";

import { createClient } from "@/utils/supabase/server";
import { DocumentService } from "@/lib/operations/DocumentService";
import { revalidatePath } from "next/cache";

export async function uploadDocumentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  const matterId = (formData.get("matterId") as string) || null;
  const title = (formData.get("title") as string)?.trim();
  const file = formData.get("file") as File | null;

  if (!title) throw new Error("Nama dokumen wajib diisi.");

  if (file && file.size > 0 && matterId) {
    try {
      await DocumentService.uploadDocumentVersion(
        orgId,
        matterId,
        "",
        file,
        user.id,
        title
      );
    } catch (e: any) {
      console.warn("Storage upload fallback:", e.message);
      // Fallback: create record directly in documents table
      await supabase.from("documents").insert({
        org_id: orgId,
        matter_id: matterId,
        title: title,
        status: "DRAFT",
      });
    }
  } else {
    // Insert document record directly
    const { error } = await supabase.from("documents").insert({
      org_id: orgId,
      matter_id: matterId,
      title: title,
      status: "DRAFT",
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dashboard/documents");
  if (matterId) {
    revalidatePath(`/dashboard/matters/${matterId}`);
  }
}

export async function updateDocumentStatusAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const documentId = formData.get("documentId") as string;
  const status = formData.get("status") as string;
  const title = (formData.get("title") as string)?.trim();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (title) {
    updateData.title = title;
  }

  const { error } = await supabase
    .from("documents")
    .update(updateData)
    .eq("id", documentId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/documents");
}

export async function deleteDocumentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const documentId = formData.get("documentId") as string;

  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/documents");
}
