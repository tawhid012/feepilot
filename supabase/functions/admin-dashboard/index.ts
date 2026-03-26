import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const encoder = new TextEncoder();

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function verifySession(token: string, secret: string) {
  const [payload, signatureHex] = token.split(".");
  if (!payload || !signatureHex || !payload.startsWith("admin:")) return false;

  const expiry = Number(payload.split(":")[1]);
  if (!expiry || Date.now() > expiry) return false;

  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, fromHex(signatureHex), encoder.encode(payload));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const sessionSecret = Deno.env.get("ADMIN_SESSION_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!sessionSecret || !supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Server env vars are missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const valid = await verifySession(token, sessionSecret);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const body = await req.json();
    const action = body.action as string;

    if (action === "validate") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "dashboard") {
      const [profilesRes, studentsRes, paymentsRes, messagesRes] = await Promise.all([
        supabase.from("profiles").select("user_id,full_name,phone,upi_id,plan,trial_end,created_at").order("created_at", { ascending: false }),
        supabase.from("students").select("id,user_id,student_name,parent_phone,created_at"),
        supabase.from("payments").select("id,user_id,student_id,month,amount,status,created_at,paid_at"),
        supabase.from("messages").select("id,user_id,message_type,content,sent_at"),
      ]);

      if (profilesRes.error || studentsRes.error || paymentsRes.error || messagesRes.error) {
        throw new Error("Failed to load dashboard data");
      }

      const profiles = profilesRes.data || [];
      const students = studentsRes.data || [];
      const payments = paymentsRes.data || [];
      const messages = messagesRes.data || [];

      const users = profiles.map((profile) => {
        const userStudents = students.filter((s) => s.user_id === profile.user_id);
        const userPayments = payments.filter((p) => p.user_id === profile.user_id);
        return {
          ...profile,
          students_count: userStudents.length,
          payments_count: userPayments.length,
          total_collected: userPayments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0),
          total_pending: userPayments.filter((p) => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0),
        };
      });

      const totalRevenue = payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const now = new Date();
      const expired = profiles.filter((p) => p.plan === "trial" && p.trial_end && new Date(p.trial_end) < now).length;
      const paid = profiles.filter((p) => p.plan !== "trial").length;
      const trial = profiles.filter((p) => p.plan === "trial").length;

      const profileName = new Map(profiles.map((p) => [p.user_id, p.full_name || "Tutor"]));
      const recentActivity = [
        ...students.slice(-10).map((s) => ({
          type: "Student Added",
          user_name: profileName.get(s.user_id) || "Tutor",
          detail: s.student_name,
          at: s.created_at,
        })),
        ...payments.slice(-10).map((p) => ({
          type: p.status === "paid" ? "Payment Marked" : "Payment Created",
          user_name: profileName.get(p.user_id) || "Tutor",
          detail: `${p.month} - ₹${Number(p.amount).toLocaleString("en-IN")}`,
          at: p.created_at,
        })),
        ...messages.slice(-10).map((m) => ({
          type: "Message Sent",
          user_name: profileName.get(m.user_id) || "Tutor",
          detail: m.message_type,
          at: m.sent_at,
        })),
      ]
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 25);

      return new Response(
        JSON.stringify({
          overview: {
            totalUsers: profiles.length,
            totalStudents: students.length,
            totalPayments: payments.length,
            totalRevenue,
          },
          users,
          activity: recentActivity,
          subscriptions: { trial, paid, expired },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "user_detail") {
      const userId = body.userId as string;
      const [userRes, studentsRes, paymentsRes] = await Promise.all([
        supabase.from("profiles").select("user_id,full_name,phone,upi_id,plan,trial_end,created_at").eq("user_id", userId).single(),
        supabase.from("students").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("payments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);
      if (userRes.error || studentsRes.error || paymentsRes.error) throw new Error("Failed to fetch user detail");

      const userPayments = paymentsRes.data || [];
      const user = {
        ...(userRes.data || {}),
        total_collected: userPayments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0),
        total_pending: userPayments.filter((p) => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0),
      };

      return new Response(JSON.stringify({ user, students: studentsRes.data || [], payments: userPayments }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_user") {
      const { userId, full_name, phone, upi_id, plan } = body;
      const { error } = await supabase
        .from("profiles")
        .update({ full_name, phone, upi_id, plan, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_user") {
      const { userId } = body;
      const { error } = await supabase.auth.admin.deleteUser(userId as string);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || "Request failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
