import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Verify the request is from an authenticated admin
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: "Invalid token" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if user is admin by checking members table
        const { data: member } = await supabaseAdmin
            .from("members")
            .select("app_role")
            .eq("user_id", user.id)
            .single();

        if (!member || member.app_role !== "admin") {
            return new Response(
                JSON.stringify({ error: "Unauthorized - Admin access required" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Get request body
        const { email, memberId, redirectTo } = await req.json();

        if (!email || !memberId) {
            return new Response(
                JSON.stringify({ error: "Email and memberId are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if member exists
        const { data: targetMember, error: memberError } = await supabaseAdmin
            .from("members")
            .select("*")
            .eq("id", memberId)
            .single();

        if (memberError || !targetMember) {
            return new Response(
                JSON.stringify({ error: "Member not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if user already exists with this email
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);

        if (existingUser) {
            // Link existing user to member
            await supabaseAdmin
                .from("members")
                .update({ user_id: existingUser.id })
                .eq("id", memberId);

            return new Response(
                JSON.stringify({
                    message: "User already exists, linked to member",
                    userId: existingUser.id
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Invite new user via email
        // Use SITE_URL env variable to ensure production URL is used in emails
        const siteUrl = Deno.env.get("SITE_URL") || "https://lexion.app";
        const finalRedirectTo = redirectTo || `${siteUrl}/auth/callback`;

        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: finalRedirectTo,
            data: {
                member_id: memberId,
                invited: true,
            },
        });

        if (inviteError) {
            console.error("Invite error:", inviteError);
            return new Response(
                JSON.stringify({ error: inviteError.message }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Update member with the new user_id
        if (inviteData?.user?.id) {
            await supabaseAdmin
                .from("members")
                .update({ user_id: inviteData.user.id })
                .eq("id", memberId);
        }

        return new Response(
            JSON.stringify({
                message: "Invitation sent successfully",
                userId: inviteData?.user?.id
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
