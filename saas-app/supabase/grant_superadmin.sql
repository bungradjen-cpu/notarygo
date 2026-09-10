-- ==============================================================================
-- NOTARYGO™ — SCRIPT PEMBERIAN AKSES SUPER ADMIN / PLATFORM ADMIN
-- ==============================================================================
-- Jalankan query ini di Supabase SQL Editor atau database Postgres Anda.

-- 1. Lihat daftar user yang terdaftar di sistem:
SELECT id, email, full_name, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- 2. Ganti 'EMAIL_ANDA@DOMAIN.COM' dengan email akun Anda:
INSERT INTO public.platform_admins (profile_id)
SELECT id 
FROM public.profiles 
WHERE email = 'EMAIL_ANDA@DOMAIN.COM' -- <-- GANTI DENGAN EMAIL ANDA
ON CONFLICT (profile_id) DO NOTHING;

-- 3. Verifikasi bahwa akun Anda sudah menjadi Super Admin:
SELECT 
    pa.id AS admin_id,
    p.id AS profile_id,
    p.email,
    p.full_name,
    pa.created_at AS granted_at
FROM public.platform_admins pa
JOIN public.profiles p ON pa.profile_id = p.id;

-- 4. Akses Portal Super Admin di aplikasi:
-- Buka: http://localhost:3000/admin
