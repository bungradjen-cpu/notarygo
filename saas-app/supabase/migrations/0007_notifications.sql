-- Migration: 0007_notifications
-- Sets up Notifications, Preferences, and Deduplication Logs.

CREATE TYPE public.notification_type AS ENUM (
  'WELCOME',
  'VERIFY_EMAIL',
  'INVITE_STAFF',
  'RESET_PASSWORD',
  'TASK_ASSIGNED',
  'DEADLINE_REMINDER',
  'OVERDUE',
  'PENDING_TOO_LONG',
  'SIGNING_REMINDER',
  'INVOICE_DUE',
  'TRIAL_ENDING',
  'SUBSCRIPTION_ACTIVATED',
  'SUBSCRIPTION_PAYMENT_FAILED',
  'SUBSCRIPTION_RENEWED',
  'DAILY_BRIEF'
);

CREATE TYPE public.notification_channel AS ENUM ('IN_APP', 'EMAIL');

-- 1. In-App Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  entity_type text, -- e.g., 'MATTER', 'TASK', 'INVOICE'
  entity_id uuid,   -- The ID of the related entity
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;

-- 2. Notification Preferences
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_daily_brief boolean NOT NULL DEFAULT true,
  email_task_assigned boolean NOT NULL DEFAULT true,
  email_deadline_reminder boolean NOT NULL DEFAULT true,
  email_overdue boolean NOT NULL DEFAULT true,
  email_invoice_due boolean NOT NULL DEFAULT true,
  email_subscription_events boolean NOT NULL DEFAULT true,
  in_app_enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 3. Deduplication Logs (Notification Logs)
-- Tracks what notifications have been sent to prevent duplicates 
-- (e.g. don't send "Task Overdue" for Task A twice on the same day)
CREATE TABLE public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  channel public.notification_channel NOT NULL,
  entity_type text,
  entity_id uuid,
  idempotency_key text NOT NULL, -- e.g. "TASK_OVERDUE_123_2026-08-29"
  sent_at timestamptz DEFAULT now(),
  UNIQUE(user_id, channel, idempotency_key)
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies
-- ==========================================

-- Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
-- System only inserts

-- Preferences
CREATE POLICY "Users can view their own preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Logs
-- System only reads/writes (Server Role bypasses RLS)
