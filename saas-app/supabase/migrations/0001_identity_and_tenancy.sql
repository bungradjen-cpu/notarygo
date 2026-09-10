-- Migration: 0001_identity_and_tenancy
-- Sets up the core profiles, organizations, and RLS helper functions.

-- Custom Types
CREATE TYPE public.org_role AS ENUM ('OWNER', 'ADMIN', 'SUPERVISOR', 'STAFF', 'FINANCE');

-- Profiles Table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Organizations Table
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notary_name text NOT NULL,
  slug text UNIQUE NOT NULL,
  address text,
  city text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization Members Table
CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'STAFF',
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, profile_id)
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_org_members_org_id ON public.organization_members(org_id);
CREATE INDEX idx_org_members_profile_id ON public.organization_members(profile_id);

-- Organization Invites Table
CREATE TABLE public.organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.org_role NOT NULL DEFAULT 'STAFF',
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Helper Functions for RLS
-- ==========================================

-- Get current profile ID
CREATE OR REPLACE FUNCTION auth.profile_id() RETURNS uuid AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- Check if user is a member of an org
CREATE OR REPLACE FUNCTION public.is_org_member(check_org_id uuid) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE org_id = check_org_id AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user has a specific role in an org
CREATE OR REPLACE FUNCTION public.has_org_role(check_org_id uuid, check_role text) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE org_id = check_org_id AND profile_id = auth.uid() AND role::text = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is OWNER of an org
CREATE OR REPLACE FUNCTION public.is_org_owner(check_org_id uuid) RETURNS boolean AS $$
BEGIN
  RETURN public.has_org_role(check_org_id, 'OWNER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==========================================
-- RLS Policies
-- ==========================================

-- PROFILES
-- Users can read all profiles in the system (or restrict to same org later)
-- For now, users can read their own profile.
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ORGANIZATIONS
CREATE POLICY "Members can view their org" ON public.organizations FOR SELECT USING (public.is_org_member(id));
-- Anyone authenticated can create an organization (for onboarding)
CREATE POLICY "Authenticated users can create orgs" ON public.organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owners can update org" ON public.organizations FOR UPDATE USING (public.is_org_owner(id));
CREATE POLICY "Owners can delete org" ON public.organizations FOR DELETE USING (public.is_org_owner(id));

-- ORGANIZATION MEMBERS
CREATE POLICY "Members can view members of their org" ON public.organization_members FOR SELECT USING (public.is_org_member(org_id));
-- The person creating the org can insert themselves as OWNER. We allow insertion if the user is OWNER OR if they are inserting themselves and the org has no members yet.
-- To simplify onboarding: Users can insert themselves if they are the FIRST member.
-- Or better, we'll handle initial org creation via a secure Postgres Function or RPC to ensure atomic Org + Member creation.
-- Let's allow users to insert themselves as OWNER if they just created the org.
CREATE POLICY "Owners and Admins can insert members" ON public.organization_members FOR INSERT WITH CHECK (
  public.has_org_role(org_id, 'OWNER') OR public.has_org_role(org_id, 'ADMIN') OR profile_id = auth.uid()
);
CREATE POLICY "Owners and Admins can update members" ON public.organization_members FOR UPDATE USING (
  public.has_org_role(org_id, 'OWNER') OR public.has_org_role(org_id, 'ADMIN')
);
CREATE POLICY "Owners and Admins can delete members" ON public.organization_members FOR DELETE USING (
  public.has_org_role(org_id, 'OWNER') OR public.has_org_role(org_id, 'ADMIN')
);

-- ORGANIZATION INVITES
CREATE POLICY "Members can view invites for their org" ON public.organization_invites FOR SELECT USING (public.is_org_member(org_id));
CREATE POLICY "Owners and Admins can insert invites" ON public.organization_invites FOR INSERT WITH CHECK (
  public.has_org_role(org_id, 'OWNER') OR public.has_org_role(org_id, 'ADMIN')
);
CREATE POLICY "Owners and Admins can update invites" ON public.organization_invites FOR UPDATE USING (
  public.has_org_role(org_id, 'OWNER') OR public.has_org_role(org_id, 'ADMIN')
);
CREATE POLICY "Owners and Admins can delete invites" ON public.organization_invites FOR DELETE USING (
  public.has_org_role(org_id, 'OWNER') OR public.has_org_role(org_id, 'ADMIN')
);

-- ==========================================
-- Auto-create profile trigger
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

