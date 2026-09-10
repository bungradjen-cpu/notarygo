-- ==============================================================================
-- NOTARYGO™ — AKTIVASI LANGSUNG TENANT RESTU DARMA SAPUTRA
-- ==============================================================================
-- Jalankan query ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nmpbdixkiaztgzzfmlfp/sql/new

-- 1. Cek data organisasi Pak Restu:
SELECT id, name, notary_name, created_at 
FROM public.organizations 
WHERE name ILIKE '%RESTU DARMA SAPUTRA%';

-- 2. Aktifkan langganan 3 Bulan (hingga 8 Desember 2026):
INSERT INTO public.subscriptions (org_id, status, current_period_start, current_period_end)
SELECT 
    id AS org_id, 
    'ACTIVE'::public.subscription_status, 
    NOW(), 
    '2026-12-08 23:59:59+00'::timestamptz
FROM public.organizations
WHERE name ILIKE '%RESTU DARMA SAPUTRA%'
ON CONFLICT (org_id) 
DO UPDATE SET 
    status = 'ACTIVE',
    current_period_end = '2026-12-08 23:59:59+00'::timestamptz,
    updated_at = NOW();

-- 3. Verifikasi status langganan sudah ACTIVE:
SELECT 
    o.name AS nama_kantor,
    s.status AS status_langganan,
    s.current_period_end AS masa_berlaku
FROM public.subscriptions s
JOIN public.organizations o ON s.org_id = o.id
WHERE o.name ILIKE '%RESTU DARMA SAPUTRA%';
