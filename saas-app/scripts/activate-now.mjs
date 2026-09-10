import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function activateNow() {
  const email = "kantornotarissantoanggles@gmail.com";
  const password = "kantornotarissantoanggles19";

  const { data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
  });

  const { data: member } = await client
    .from("organization_members")
    .select("org_id")
    .eq("profile_id", authData.user.id)
    .single();

  const orgId = member.org_id;

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days / 1 month

  console.log(`Inserting active subscription event for orgId: ${orgId}...`);
  const { data: inserted, error } = await client
    .from("subscription_events")
    .insert({
      org_id: orgId,
      event_type: "payment.received",
      previous_status: "EXPIRED",
      new_status: "ACTIVE",
      metadata: {
        customer_email: email,
        amount: 129000,
        plan_name: "1 Bulan",
        duration_days: 30,
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
        period_end: endDate.toISOString(),
        status: "ACTIVE",
      },
    })
    .select();

  console.log("Insert result:", { inserted, error });
}

activateNow().catch(console.error);
