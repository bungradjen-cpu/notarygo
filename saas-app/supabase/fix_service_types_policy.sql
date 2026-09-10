-- ==============================================================================
-- FIX SERVICE TYPES POLICY & DEFAULT SERVICES SEED
-- ==============================================================================
-- Jalankan query ini di Supabase SQL Editor untuk mengizinkan pembuatan jenis layanan/akta baru
-- dan menambahkan template standar akta.

-- 1. Tambahkan policy INSERT & UPDATE untuk service_types
DROP POLICY IF EXISTS "Members can insert service types" ON public.service_types;
CREATE POLICY "Members can insert service types" ON public.service_types 
  FOR INSERT WITH CHECK (public.is_org_member(org_id));

DROP POLICY IF EXISTS "Members can update service types" ON public.service_types;
CREATE POLICY "Members can update service types" ON public.service_types 
  FOR UPDATE USING (public.is_org_member(org_id) AND deleted_at IS NULL);

-- 2. Buatkan template layanan standar untuk semua organisasi yang belum memilikinya
INSERT INTO public.service_types (org_id, code, name)
SELECT o.id, s.code, s.name
FROM public.organizations o
CROSS JOIN (
  VALUES 
    ('AJB', 'Akta Jual Beli (AJB)'),
    ('SKMHT', 'Surat Kuasa Membebankan Hak Tanggungan (SKMHT)'),
    ('APHT', 'Akta Pemberian Hak Tanggungan (APHT)'),
    ('PT', 'Pendirian Perseroan Terbatas (PT)'),
    ('PPJB', 'Perjanjian Pengikatan Jual Beli (PPJB)'),
    ('HIBAH', 'Akta Hibah'),
    ('WARIS', 'Keterangan Hak Waris & Wasiat'),
    ('SHM', 'Sertifikat Hak Milik (SHM)')
) AS s(code, name)
ON CONFLICT (org_id, code) DO NOTHING;

-- 3. Izinkan service_type_id di tabel matters bernilai NULL (opsional / fallback jika tanpa jenis layanan)
ALTER TABLE public.matters ALTER COLUMN service_type_id DROP NOT NULL;
