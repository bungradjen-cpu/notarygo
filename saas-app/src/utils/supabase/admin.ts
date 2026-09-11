import { createClient } from '@supabase/supabase-js';
import { env } from '@/env';

// This client bypasses Row Level Security (RLS) and is ONLY safe to use in Server Actions
// when the user's role has been explicitly validated as OWNER or ADMIN.
export function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
