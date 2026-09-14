import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { DocumentService } from "@/lib/operations/DocumentService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: documentId } = await params;
    const adminClient = createAdminClient();

    // 1. Fetch document
    const { data: document, error: docErr } = await adminClient
      .from("documents")
      .select("id, org_id, title, current_version_id")
      .eq("id", documentId)
      .single();

    if (docErr || !document) {
      return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });
    }

    // 2. Verify user belongs to the same organization
    const { data: membership } = await adminClient
      .from("organization_members")
      .select("id")
      .eq("org_id", document.org_id)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: "Akses ditolak ke berkas kantor ini" }, { status: 403 });
    }

    // 3. Find latest document version
    let filePath: string | null = null;

    if (document.current_version_id) {
      const { data: version } = await adminClient
        .from("document_versions")
        .select("file_path")
        .eq("id", document.current_version_id)
        .maybeSingle();
      filePath = version?.file_path || null;
    }

    if (!filePath) {
      // Fallback: search any version for this document
      const { data: latestVer } = await adminClient
        .from("document_versions")
        .select("file_path")
        .eq("document_id", documentId)
        .order("version_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      filePath = latestVer?.file_path || null;
    }

    if (!filePath) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;padding:40px;text-align:center;"><h2>Berkas Fisik Belum Tersedia</h2><p>Dokumen "<b>${document.title}</b>" tercatat di sistem tetapi belum memiliki lampiran berkas yang diunggah.</p><a href="javascript:history.back()">Kembali</a></body></html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 404 }
      );
    }

    // 4. Generate signed URL
    const signedUrl = await DocumentService.getSignedUrl(filePath, 3600);
    return NextResponse.redirect(signedUrl);
  } catch (error: any) {
    console.error("Download route error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengunduh dokumen" },
      { status: 500 }
    );
  }
}
