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

async function check() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: "bungradjen@gmail.com",
    password: "yunan0101",
  });

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    },
  });

  const { data: st, error: stErr } = await userClient.from("service_types").select("*");
  console.log("Service types:", st, stErr?.message);

  const { data: orgs } = await userClient.from("organizations").select("id, name");
  console.log("Orgs:", orgs);

  // Try insert service type
  if (orgs && orgs.length > 0) {
    const { data: newSt, error: insErr } = await userClient.from("service_types").insert({
      org_id: orgs[0].id,
      code: "AJB",
      name: "Akta Jual Beli",
    }).select();
    console.log("Insert ST:", newSt, insErr?.message);
  }
}

check().catch(console.error);
