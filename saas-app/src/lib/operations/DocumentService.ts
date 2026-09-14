import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { EntitlementService, EntitlementError } from "../billing/EntitlementService";
import { WorkflowEngine } from "./WorkflowEngine";

export class DocumentService {
  /**
   * Validates and uploads a document version to Supabase Storage.
   */
  static async uploadDocumentVersion(
    orgId: string, 
    matterId: string, 
    documentId: string, 
    file: File, 
    userId: string,
    title?: string // Only provided for completely new documents
  ) {
    const adminClient = createAdminClient();

    // 1. Validation: MIME Type with extension fallback
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const extMimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };

    let effectiveMime = file.type;
    if (!allowedMimes.includes(effectiveMime) && extMimeMap[ext]) {
      effectiveMime = extMimeMap[ext];
    }

    if (!allowedMimes.includes(effectiveMime)) {
      throw new Error(`Tipe berkas tidak didukung: ${file.name}. Format yang diizinkan: PDF, Word (.doc, .docx), dan Gambar (.jpg, .png).`);
    }

    // 2. Validation: File Size (Max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`Ukuran berkas melebihi batas maksimal 20MB.`);
    }

    // 3. Validation: Storage Entitlement
    let limit = await EntitlementService.getEntitlementLimit(orgId, "storage_limit_bytes");
    if (limit <= 0 && limit !== -1) {
      limit = 10 * 1024 * 1024 * 1024; // 10 GB default fallback
    }

    // 4. Create Document Entity if this is V1
    let activeDocumentId = documentId;
    let nextVersionNumber = 1;

    if (!activeDocumentId) {
      if (!title) throw new Error("Nama dokumen wajib diisi.");
      const { data: newDoc, error: docError } = await adminClient
        .from("documents")
        .insert({
          org_id: orgId,
          matter_id: matterId,
          title: title,
        })
        .select("id")
        .single();
      
      if (docError || !newDoc) {
        throw new Error("Gagal membuat data dokumen: " + (docError?.message || ""));
      }
      activeDocumentId = newDoc.id;
    } else {
      // Get the latest version number
      const { data: latestVersion } = await adminClient
        .from("document_versions")
        .select("version_number")
        .eq("document_id", activeDocumentId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (latestVersion) {
        nextVersionNumber = latestVersion.version_number + 1;
      }
    }

    // 5. Upload to Storage using adminClient
    const fileExtension = ext || 'pdf';
    const filePath = `${orgId}/${matterId}/${activeDocumentId}/v${nextVersionNumber}_${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await adminClient.storage
      .from('tenant_documents')
      .upload(filePath, file, { contentType: effectiveMime, upsert: true });
    
    if (uploadError) {
      console.error("Storage upload failed:", uploadError);
      throw new Error(`Gagal mengunggah ke penyimpanan: ${uploadError.message}`);
    }

    // 6. Create Document Version Record
    const { data: versionRecord, error: versionError } = await adminClient
      .from("document_versions")
      .insert({
        document_id: activeDocumentId,
        version_number: nextVersionNumber,
        file_path: filePath,
        file_size: file.size,
        mime_type: effectiveMime,
        uploaded_by: userId,
      })
      .select("id")
      .single();

    if (versionError || !versionRecord) {
      console.error("Version record error:", versionError);
      throw new Error("Gagal mencatat versi dokumen.");
    }

    // 7. Update current_version_id on main document
    await adminClient
      .from("documents")
      .update({ current_version_id: versionRecord.id, updated_at: new Date().toISOString() })
      .eq("id", activeDocumentId);
    
    // 8. Log Activity
    try {
      await WorkflowEngine.logActivity(orgId, userId, nextVersionNumber === 1 ? "DOCUMENT_CREATED" : "DOCUMENT_UPDATED", "documents", activeDocumentId, { version: nextVersionNumber, fileName: file.name });
    } catch (e) {
      console.warn("Could not log activity:", e);
    }

    return activeDocumentId;
  }

  /**
   * Retrieves a signed URL for a specific document version.
   */
  static async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage
      .from('tenant_documents')
      .createSignedUrl(filePath, expiresIn);
    
    if (error || !data) throw new Error("Gagal membuat tautan unduhan: " + (error?.message || ""));
    return data.signedUrl;
  }
}
