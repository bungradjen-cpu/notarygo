import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

async function check() {
  const { data: authData } = await supabase.auth.signInWithPassword({
    email: "kantornotarissantoanggles@gmail.com",
    password: "kantornotarissantoanggles19",
  });

  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } },
  });

  const { data: allEvents, error } = await client.from("subscription_events").select("*");
  console.log("Error:", error);
  console.log("All Events count:", allEvents?.length);
  console.log("Events:", allEvents);
}

check().catch(console.error);
