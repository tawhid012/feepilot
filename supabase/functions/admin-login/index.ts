const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const encoder = new TextEncoder();

// NOTE: Hardcoded admin credentials are insecure and should only be used for dev/testing.
// For production, use Supabase Edge Function secrets (ADMIN_USERNAME/ADMIN_PASSWORD/ADMIN_SESSION_SECRET).
const ADMIN_USERNAME = "admin@feepilot";
const ADMIN_PASSWORD = "limuxagencies";
const ADMIN_SESSION_SECRET = "feepilot-admin-session-secret-v1";

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function signSession(payload: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${payload}.${toHex(signature)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const token = await signSession(`admin:${expiresAt}`, ADMIN_SESSION_SECRET);

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Request failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
