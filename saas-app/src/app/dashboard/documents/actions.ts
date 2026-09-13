"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { DocumentService } from "@/lib/operations/DocumentService";
import { revalidatePath } from "next/cache";

export async function uploadDocumentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const orgId = formData.get("orgId") as string;
  let matterId = (formData.get("matterId") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim();
  const file = formData.get("file") as File | null;

  if (!title) throw new Error("Nama dokumen wajib diisi.");

  const adminClient = createAdminClient();

  // If matterId is not selected, link or auto-provision a general matter for the office!
  if (!matterId) {
    const { data: existingGeneralMatter } = await adminClient
      .from("matters")
      .select("id")
      .eq("org_id", orgId)
      .ilike("title", "%Dokumen Umum%")
      .maybeSingle();

    if (existingGeneralMatter) {
      matterId = existingGeneralMatter.id;
    } else {
      // Check if ANY matter exists in this office
      const { data: anyMatter } = await adminClient
        .from("matters")
        .select("id")
        .eq("org_id", orgId)
        .limit(1)
        .maybeSingle();

      if (anyMatter) {
        matterId = anyMatter.id;
      } else {
        // Auto-provision client & service type for general office archives
        let { data: defaultClient } = await adminClient
          .from("clients")
          .select("id")
          .eq("org_id", orgId)
          .limit(1)
          .maybeSingle();

        if (!defaultClient) {
          const { data: newClient } = await adminClient
            .from("clients")
            .insert({
              org_id: orgId,
              name: "Klien Umum / Internal",
              client_type: "INDIVIDUAL",
            })
            .select("id")
            .single();
          defaultClient = newClient;
        }

        let { data: defaultService } = await adminClient
          .from("service_types")
          .select("id")
          .eq("org_id", orgId)
          .limit(1)
          .maybeSingle();

        if (!defaultService) {
          const { data: newService } = await adminClient
            .from("service_types")
            .insert({
              org_id: orgId,
              code: "UMUM",
              name: "Dokumen & Arsip Umum",
            })
            .select("id")
            .single();
          defaultService = newService;
        }

        if (defaultClient && defaultService) {
          const { data: newMatter } = await adminClient
            .from("matters")
            .insert({
              org_id: orgId,
              client_id: defaultClient.id,
              service_type_id: defaultService.id,
              matter_number: `MAT-UMUM-${new Date().getFullYear()}`,
              title: "Dokumen & Berkas Umum Kantor",
              status: "OPEN",
              pic_id: user.id,
            })
            .select("id")
            .single();

          matterId = newMatter?.id || null;
        }
      }
    }
  }

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
      await adminClient.from("documents").insert({
        org_id: orgId,
        matter_id: matterId,
        title: title,
        status: "DRAFT",
      });
    }
  } else if (matterId) {
    // Insert document record directly
    const { error } = await adminClient.from("documents").insert({
      org_id: orgId,
      matter_id: matterId,
      title: title,
      status: "DRAFT",
    });
    if (error) {
      console.error("Document insert error:", error);
      throw new Error("Gagal menyimpan dokumen: " + error.message);
    }
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
