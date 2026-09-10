import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const targetEmail = "bungradjen@gmail.com";
const targetPassword = "yunan0101";
const targetFullName = "Ezra";

async function main() {
  console.log(`Setting up Super Admin for: ${targetEmail}...`);

  // 1. Check if user already exists in auth.users
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
  }

  let user = usersData?.users?.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());

  if (!user) {
    console.log("User does not exist in Auth, creating new user...");
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        full_name: targetFullName,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError.message);
      process.exit(1);
    }
    user = createData.user;
    console.log(`User created successfully with ID: ${user.id}`);
  } else {
    console.log(`User already exists with ID: ${user.id}. Updating password and metadata...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        full_name: targetFullName,
      },
    });

    if (updateError) {
      console.error("Error updating user:", updateError.message);
    } else {
      console.log("Password and email confirmation updated successfully.");
    }
  }

  // 2. Ensure profile exists in public.profiles
  const { data: existingProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    console.log("Creating profile record in public.profiles...");
    const { error: profileInsertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: targetEmail,
      full_name: targetFullName,
    });
    if (profileInsertError) {
      console.error("Error creating profile:", profileInsertError.message);
    } else {
      console.log("Profile created successfully.");
    }
  } else {
    console.log("Updating profile record in public.profiles...");
    await supabase.from("profiles").update({
      full_name: targetFullName,
      email: targetEmail,
    }).eq("id", user.id);
  }

  // 3. Insert into public.platform_admins
  console.log("Granting Super Admin privileges in public.platform_admins...");
  const { data: existingAdmin, error: adminFetchError } = await supabase
    .from("platform_admins")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!existingAdmin) {
    const { error: adminInsertError } = await supabase.from("platform_admins").insert({
      profile_id: user.id,
    });

    if (adminInsertError) {
      console.error("Error inserting into platform_admins:", adminInsertError.message);
      process.exit(1);
    }
    console.log("Successfully granted Super Admin access in public.platform_admins!");
  } else {
    console.log("User is already registered in public.platform_admins.");
  }

  console.log("\n========================================================");
  console.log("🎉 SUPER ADMIN SETUP COMPLETE!");
  console.log(`👤 Name:     ${targetFullName}`);
  console.log(`📧 Email:    ${targetEmail}`);
  console.log(`🔑 Password: ${targetPassword}`);
  console.log(`🌐 Admin URL: http://localhost:3000/admin`);
  console.log("========================================================");
}

main().catch(console.error);
