import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function verify() {
  const targetEmail = "kantornotarissantoanggles@gmail.com";
  const targetPassword = "kantornotarissantoanggles19";

  console.log(`\n=== Verifying Dashboard Access for ${targetEmail} ===`);

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password: targetPassword,
  });

  if (authError || !authData.session) {
    console.error("Authentication failed:", authError?.message);
    process.exit(1);
  }

  const client = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${authData.session.access_token}` },
    },
  });

  const { data: member } = await client
    .from("organization_members")
    .select("org_id, role, organizations(name, notary_name)")
    .eq("profile_id", authData.user.id)
    .single();

  console.log("Member details:", member);

  // Exact check from DashboardLayout
  let isSubActive = false;

  const { data: sub } = await client
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("org_id", member.org_id)
    .maybeSingle();

  if (sub && sub.status === "ACTIVE") {
    if (!sub.current_period_end || new Date(sub.current_period_end) > new Date()) {
      isSubActive = true;
    }
  }

  if (!isSubActive) {
    const { data: latestEvent, error: evtErr } = await client
      .from("subscription_events")
      .select("*")
      .eq("org_id", member.org_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (evtErr) {
      console.warn("Event query notice:", evtErr.message);
    }

    if (latestEvent && latestEvent.new_status === "ACTIVE") {
      const periodEnd =
        latestEvent.metadata?.period_end ||
        latestEvent.metadata?.current_period_end;
      if (!periodEnd || new Date(periodEnd) > new Date()) {
        isSubActive = true;
      }
    }
  }

  console.log(`\n🎯 Dashboard Paywall Status: ${isSubActive ? "✅ UNLOCKED & ACTIVE (Akses Penuh Terbuka)" : "❌ LOCKED"}`);
}

verify().catch(console.error);
