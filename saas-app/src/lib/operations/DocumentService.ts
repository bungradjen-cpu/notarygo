import { createClient } from "@/utils/supabase/server";
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
    const supabase = await createClient();

    // 1. Validation: MIME Type
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedMimes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Allowed types are PDF, Word, and Images.`);
    }

    // 2. Validation: File Size (Max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File size exceeds 20MB limit.`);
    }

    // 3. Validation: Storage Entitlement (Calculate current sum)
    let limit = await EntitlementService.getEntitlementLimit(orgId, "storage_limit_bytes");
    if (limit <= 0 && limit !== -1) {
      limit = 10 * 1024 * 1024 * 1024; // 10 GB default fallback
    }
    
    if (limit !== -1) {
      // Calculate current total storage
      const { data: usageData, error: usageError } = await supabase
        .rpc('get_org_storage_sum', { query_org_id: orgId }); // Fallback if RPC doesn't exist, we can use a direct query
        // Let's use direct query instead of requiring a new RPC in this snippet
        
      const { data: allDocs } = await supabase
        .from('document_versions')
        .select('file_size')
        // Ideally we filter by org_id, but document_versions doesn't have org_id directly. 
        // Our RLS handles isolation, but for SUM we need to join. 
        // We can just rely on the RLS returning only org documents:
        
      let totalUsage = 0;
      if (allDocs) {
        totalUsage = allDocs.reduce((sum, doc) => sum + Number(doc.file_size), 0);
      }

      if (totalUsage + file.size > limit) {
        throw new EntitlementError(`Storage limit exceeded. You have used ${totalUsage} bytes out of ${limit}.`);
      }
    }

    // 4. Create Document Entity if this is V1
    let activeDocumentId = documentId;
    let nextVersionNumber = 1;

    if (!activeDocumentId) {
      if (!title) throw new Error("Title is required for a new document.");
      const { data: newDoc, error: docError } = await supabase
        .from("documents")
        .insert({
          org_id: orgId,
          matter_id: matterId,
          title: title,
        })
        .select("id")
        .single();
      
      if (docError || !newDoc) throw new Error("Failed to create document record.");
      activeDocumentId = newDoc.id;
    } else {
      // Get the latest version number
      const { data: latestVersion } = await supabase
        .from("document_versions")
        .select("version_number")
        .eq("document_id", activeDocumentId)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();
      
      if (latestVersion) {
        nextVersionNumber = latestVersion.version_number + 1;
      }
    }

    // 5. Upload to Storage
    const ext = file.name.split('.').pop();
    const filePath = `${orgId}/${matterId}/${activeDocumentId}/v${nextVersionNumber}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('tenant_documents')
      .upload(filePath, file, { upsert: false }); // Strictly no overwriting
    
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    // 6. Create Document Version Record
    const { data: versionRecord, error: versionError } = await supabase
      .from("document_versions")
      .insert({
        document_id: activeDocumentId,
        version_number: nextVersionNumber,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: userId,
      })
      .select("id")
      .single();

    if (versionError || !versionRecord) {
      // Rollback storage if DB insert fails
      await supabase.storage.from('tenant_documents').remove([filePath]);
      throw new Error("Failed to create document version record.");
    }

    // 7. Update current_version_id on main document
    await supabase
      .from("documents")
      .update({ current_version_id: versionRecord.id, updated_at: new Date().toISOString() })
      .eq("id", activeDocumentId);
    
    // 8. Log Activity
    await WorkflowEngine.logActivity(orgId, userId, nextVersionNumber === 1 ? "DOCUMENT_CREATED" : "DOCUMENT_UPDATED", "documents", activeDocumentId, { version: nextVersionNumber, fileName: file.name });

    return activeDocumentId;
  }

  /**
   * Retrieves a signed URL for a specific document version.
   */
  static async getSignedUrl(filePath: string, expiresIn: number = 60): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from('tenant_documents')
      .createSignedUrl(filePath, expiresIn);
    
    if (error || !data) throw new Error("Failed to generate signed URL.");
    return data.signedUrl;
  }
}
