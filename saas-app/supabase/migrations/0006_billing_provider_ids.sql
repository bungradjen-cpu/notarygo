-- Migration: 0006_billing_provider_ids
-- Adds provider-specific IDs to existing tables for Mayar.id integration.

-- Add Mayar Customer ID to Organizations
ALTER TABLE public.organizations 
ADD COLUMN mayar_customer_id text UNIQUE;

-- Add Mayar Subscription ID and Payment Link ID to Subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN mayar_subscription_id text UNIQUE,
ADD COLUMN mayar_payment_link_id text;

-- Add an index for fast lookup by Webhook
CREATE INDEX idx_subscriptions_mayar_sub_id ON public.subscriptions(mayar_subscription_id);
CREATE INDEX idx_orgs_mayar_cust_id ON public.organizations(mayar_customer_id);
