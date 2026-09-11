import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function checkMember() {
  const email = "inamarsina7@gmail.com";
  
  console.log("Checking member:", email);

  // 1. Get profile
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').eq('email', email);
  if (pError) {
    console.log("Error fetching profile:", pError);
  }
  if (!profiles || profiles.length === 0) {
    console.log("Profile not found for email:", email);
    
    const { data: users, error: uError } = await supabase.auth.admin.listUsers();
    if (uError) {
      console.log("Error fetching auth users:", uError.message);
    } else if (users && users.users) {
       const u = users.users.find(u => u.email === email);
       if (u) {
         console.log("User exists in auth.users but not profiles:", u.id);
       } else {
         console.log("User also not found in auth.users");
       }
    }
    return;
  }
  const profile = profiles[0];
  console.log("Profile found:", profile);

  // 2. Get organizations and subscriptions
  const { data: members, error: mError } = await supabase
    .from('organization_members')
    .select('role, organizations(*, subscriptions(*))')
    .eq('profile_id', profile.id);
  
  if (mError) {
    console.log("Error fetching members:", mError);
    return;
  }
  console.log("Organizations and Subscriptions:");
  console.dir(members, { depth: null });
}

checkMember().catch(console.error);
