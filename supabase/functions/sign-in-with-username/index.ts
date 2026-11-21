// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanUsername = String(username).toLowerCase().trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    // Note: SUPABASE_ANON_KEY is not always present in hosted Supabase Deno env.
    // Fall back to the apikey header passed by the frontend client or service key.
    const authKey = Deno.env.get("SUPABASE_ANON_KEY") || req.headers.get("apikey") || supabaseServiceKey;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
      return new Response(
        JSON.stringify({ error: "Server configuration missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Privately resolve the username to an email using the service-role client on the server side
    // This query runs exclusively inside the Edge Function runtime and is NEVER exposed to public clients.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .ilike("username", cleanUsername)
      .maybeSingle();

    if (profileError || !profile || !profile.email) {
      // Return a uniform error to prevent user enumeration
      return new Response(
        JSON.stringify({ error: "Invalid username or password. Please verify your credentials." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Authenticate the user with their resolved email using Supabase Auth (GoTrue)
    // Supabase Auth handles rate limiting, password validation, lockout policies, and email confirmation status.
    const supabaseClient = createClient(supabaseUrl, authKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: profile.email,
      password: String(password),
    });

    if (authError) {
      console.warn("Auth error in sign-in-with-username:", authError.message);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Return the authenticated session to the client (without exposing sensitive internals)
    return new Response(
      JSON.stringify({
        session: authData.session,
        user: authData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
