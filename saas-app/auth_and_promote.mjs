import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

const targetEmail = "bungradjen@gmail.com";
const targetPassword = "yunan0101";
const targetFullName = "Ezra";

async function run() {
  console.log(`Checking / Authenticating user ${targetEmail}...`);

  // 1. Try Signing In
  let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password: targetPassword,
  });

  if (signInError) {
    console.log("Sign-in failed (user may not exist yet or password differs). Attempting Sign-Up...", signInError.message);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: targetEmail,
      password: targetPassword,
      options: {
        data: {
          full_name: targetFullName,
        },
      },
    });

    if (signUpError) {
      console.error("Sign-up error:", signUpError.message);
    } else {
      console.log("Sign-up successful! User ID:", signUpData?.user?.id);
      authData = signUpData;
    }
  } else {
    console.log("Sign-in successful! User ID:", authData?.user?.id);
  }

  const userId = authData?.user?.id;
  if (!userId) {
    console.error("Could not obtain User ID.");
    return;
  }

  // Use authenticated client with user's session
  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authData?.session?.access_token}`,
      },
    },
  });

  // Check / Upsert Profile
  const { data: profile, error: profileErr } = await userClient
    .from("profiles")
    .upsert({
      id: userId,
      email: targetEmail,
      full_name: targetFullName,
    })
    .select()
    .single();

  console.log("Profile status:", profile ? "OK" : profileErr?.message);

  // Try inserting into platform_admins
  const { data: adminData, error: adminErr } = await userClient
    .from("platform_admins")
    .insert({ profile_id: userId })
    .select();

  console.log("Platform admin insert status:", adminData ? "SUCCESS" : adminErr?.message);
}

run().catch(console.error);
