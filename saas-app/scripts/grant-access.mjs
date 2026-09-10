import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: true, persistSession: false },
});

async function grantAccess() {
  const targetEmail = "kantornotarissantoanggles@gmail.com".toLowerCase().trim();
  const targetPassword = "kantornotarissantoanggles19";
  const fullName = "Dr. Santo Anggles, S.H., M.Kn.";
  const orgName = "Kantor Notaris & PPAT Dr. Santo Anggles, S.H., M.Kn.";

  console.log(`\n=== Granting 1-Month Active Access to ${targetEmail} ===`);

  // 1. Try Signing In first
  let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password: targetPassword,
  });

  let session = authData?.session;
  let user = authData?.user;

  if (signInError || !session) {
    console.log(`SignIn result: ${signInError?.message || "No session"}. Trying SignUp...`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: targetEmail,
      password: targetPassword,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      console.error("SignUp error:", signUpError.message);
      process.exit(1);
    }

    user = signUpData.user;
    session = signUpData.session;
    console.log(`SignUp successful for user: ${user?.id}`);

    // If session is still null (e.g. email confirmation required or auto-signed-in)
    if (!session) {
      const retrySignIn = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword,
      });
      session = retrySignIn.data?.session;
      user = retrySignIn.data?.user || user;
    }
  } else {
    console.log(`SignIn successful! User ID: ${user?.id}`);
  }

  const client = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {},
    },
  });

  const userId = user?.id;
  if (!userId) {
    console.error("Could not obtain user ID.");
    process.exit(1);
  }

  // 2. Ensure Profile
  const { error: profileError } = await client.from("profiles").upsert({
    id: userId,
    email: targetEmail,
    full_name: fullName,
  });
  if (profileError) {
    console.warn("Profile upsert notice:", profileError.message);
  } else {
    console.log("Profile verified in 'profiles' table.");
  }

  // 3. Find or Create Organization
  const { data: existingMember } = await client
    .from("organization_members")
    .select("org_id, role")
    .eq("profile_id", userId)
    .maybeSingle();

  let orgId = existingMember?.org_id;

  if (!orgId) {
    orgId = crypto.randomUUID();
    const slug = `kantor-notaris-santo-anggles-${Date.now().toString().slice(-4)}`;
    console.log(`Creating Organization '${orgName}' (ID: ${orgId})...`);

    const { error: orgError } = await client.from("organizations").insert({
      id: orgId,
      name: orgName,
      notary_name: fullName,
      slug: slug,
    });

    if (orgError) {
      console.error("Error creating organization:", orgError.message);
    }

    const { error: memError } = await client.from("organization_members").insert({
      org_id: orgId,
      profile_id: userId,
      role: "OWNER",
    });

    if (memError) {
      console.error("Error creating organization member:", memError.message);
    }
    console.log("Organization created and user assigned as OWNER.");
  } else {
    console.log(`Found existing organization: ${orgId}`);
  }

  // 4. Set Subscription for 30 Days (1 Month)
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  console.log(`Setting Subscription to ACTIVE until: ${endDate.toISOString()} (${endDate.toLocaleDateString("id-ID", { dateStyle: "full" })})`);

  const { data: existingSub } = await client
    .from("subscriptions")
    .select("id")
    .eq("org_id", orgId)
    .maybeSingle();

  if (existingSub) {
    const { error: subUpdateError } = await client
      .from("subscriptions")
      .update({
        status: "ACTIVE",
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
      })
      .eq("org_id", orgId);

    if (subUpdateError) {
      console.error("Failed to update subscription:", subUpdateError.message);
    } else {
      console.log("Existing subscription updated to ACTIVE (30 days).");
    }
  } else {
    const { error: subInsertError } = await client
      .from("subscriptions")
      .insert({
        org_id: orgId,
        status: "ACTIVE",
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
      });

    if (subInsertError) {
      console.error("Failed to insert subscription:", subInsertError.message);
    } else {
      console.log("New subscription inserted with status ACTIVE (30 days).");
    }
  }

  // 5. Also log payment event in subscription_events so it remains verified
  await client.from("subscription_events").insert({
    org_id: orgId,
    event_type: "MANUAL_ACTIVATION_1_MONTH",
    previous_status: "EXPIRED",
    new_status: "ACTIVE",
    metadata: {
      customer_email: targetEmail,
      full_name: fullName,
      duration_days: 30,
      period_end: endDate.toISOString(),
      granted_at: new Date().toISOString(),
    },
  });

  console.log("\n=======================================================");
  console.log("✅ SUKSES: Akses 1 Bulan Aktif telah diberikan!");
  console.log(`- Email    : ${targetEmail}`);
  console.log(`- Password : ${targetPassword}`);
  console.log(`- Status   : ACTIVE`);
  console.log(`- Masa Aktif: Sampai ${endDate.toLocaleDateString("id-ID", { dateStyle: "full" })} (30 Hari)`);
  console.log("=======================================================\n");
}

grantAccess().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
