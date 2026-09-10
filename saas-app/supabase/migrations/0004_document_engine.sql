-- Migration: 0004_document_engine
-- Sets up Document tracking, versioning, and Supabase Storage bucket configurations.

-- ==========================================
-- Enums
-- ==========================================
CREATE TYPE public.document_status AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'FINAL', 'SIGNED');

-- ==========================================
-- Core Entities
-- ==========================================

-- Documents (The logical file container)
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id uuid NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  title text NOT NULL,
  status public.document_status NOT NULL DEFAULT 'DRAFT',
  current_version_id uuid, -- Will be set via foreign key after version creation or updated by trigger
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_documents_org_id ON public.documents(org_id);
CREATE INDEX idx_documents_matter_id ON public.documents(matter_id);

-- Document Versions (The physical file uploads)
CREATE TABLE public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  file_path text NOT NULL, -- The Supabase Storage object path
  file_size bigint NOT NULL DEFAULT 0, -- In bytes
  mime_type text NOT NULL,
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(document_id, version_number)
);
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Set up the circular foreign key for current_version_id
ALTER TABLE public.documents ADD CONSTRAINT fk_current_version FOREIGN KEY (current_version_id) REFERENCES public.document_versions(id) ON DELETE SET NULL;

-- ==========================================
-- RLS Policies
-- ==========================================

-- Documents
CREATE POLICY "Members can view documents" ON public.documents FOR SELECT USING (public.is_org_member(org_id) AND deleted_at IS NULL);
CREATE POLICY "Members can insert documents" ON public.documents FOR INSERT WITH CHECK (public.is_org_member(org_id));
CREATE POLICY "Members can update documents" ON public.documents FOR UPDATE USING (public.is_org_member(org_id) AND deleted_at IS NULL);

-- Document Versions
-- Note: We must verify org_id by joining with documents table since document_versions doesn't store org_id directly.
CREATE POLICY "Members can view document versions" ON public.document_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND public.is_org_member(d.org_id) AND deleted_at IS NULL)
);
CREATE POLICY "Members can insert document versions" ON public.document_versions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.documents d WHERE d.id = document_id AND public.is_org_member(d.org_id))
);

-- ==========================================
-- Storage Configurations
-- ==========================================
-- In Supabase, you interact with the `storage` schema directly to create buckets.
-- We create a single private bucket called 'tenant_documents'.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant_documents',
  'tenant_documents',
  false,
  20971520, -- 20 MB Limit per file roughly
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- We enforce that users can only upload, read, and delete objects in paths starting with their org_id.
-- Path Format: org_id/matter_id/document_id/vX_filename

CREATE POLICY "Members can view tenant objects" ON storage.objects FOR SELECT USING (
  bucket_id = 'tenant_documents' AND 
  public.is_org_member((string_to_array(name, '/'))[1]::uuid)
);

CREATE POLICY "Members can upload tenant objects" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'tenant_documents' AND 
  public.is_org_member((string_to_array(name, '/'))[1]::uuid)
);

CREATE POLICY "Members can update tenant objects" ON storage.objects FOR UPDATE USING (
  bucket_id = 'tenant_documents' AND 
  public.is_org_member((string_to_array(name, '/'))[1]::uuid)
);

CREATE POLICY "Members can delete tenant objects" ON storage.objects FOR DELETE USING (
  bucket_id = 'tenant_documents' AND 
  public.is_org_member((string_to_array(name, '/'))[1]::uuid)
);
