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

async function test() {
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

  const { data: isAdmin, error: rpcErr } = await userClient.rpc("is_platform_admin");
  console.log("is_platform_admin RPC result:", isAdmin, rpcErr ? rpcErr.message : "NO_ERROR");
}

test().catch(console.error);
