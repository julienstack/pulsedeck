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

        // Get request body first to know which organization we're working with
        const { email, memberId, redirectTo } = await req.json();

        if (!email || !memberId) {
            return new Response(
                JSON.stringify({ error: "Email and memberId are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if target member exists and get their organization
        const { data: targetMember, error: memberError } = await supabaseAdmin
            .from("members")
            .select("*, organization:organizations(id, name)")
            .eq("id", memberId)
            .single();

        if (memberError || !targetMember) {
            return new Response(
                JSON.stringify({ error: "Member not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Now check if the requesting user is an admin of the target member's organization
        const { data: adminMember } = await supabaseAdmin
            .from("members")
            .select("app_role")
            .eq("user_id", user.id)
            .eq("organization_id", targetMember.organization_id)
            .single();

        if (!adminMember || adminMember.app_role !== "admin") {
            return new Response(
                JSON.stringify({ error: "Unauthorized - Admin access required for this organization" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if user already exists
        let existingUser;

        // 1. Check if member already has a user_id linked
        if (targetMember.user_id) {
            const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(targetMember.user_id);
            if (!userError && user) {
                existingUser = user;
            }
        }

        // 2. If not found by ID, search by email (with higher limit)
        if (!existingUser) {
            const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
            existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
        }

        if (existingUser) {
            if (existingUser.email_confirmed_at) {
                // User exists and is confirmed, send password reset email
                const siteUrl = Deno.env.get("SITE_URL") || "https://pulsedeck.de";
                const finalRedirectTo = redirectTo || `${siteUrl}/auth/callback`;

                // Use the regular client method which actually sends the email
                // Note: We create a new client without service role to use the regular auth methods
                const supabaseClient = createClient(
                    Deno.env.get("SUPABASE_URL") ?? "",
                    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
                );

                // CRITICAL: Link the user to the member record BEFORE sending the email
                // This ensures that when they log in (via reset link), they are already connected
                await supabaseAdmin
                    .from("members")
                    .update({ user_id: existingUser.id })
                    .eq("id", memberId);

                const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(
                    email,
                    { redirectTo: finalRedirectTo }
                );

                if (resetError) {
                    console.error("Password reset error:", resetError);
                    return new Response(
                        JSON.stringify({ error: resetError.message }),
                        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                    );
                }

                return new Response(
                    JSON.stringify({
                        message: "Passwort-Reset E-Mail gesendet",
                        type: "reset",
                        userId: existingUser.id
                    }),
                    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            } else {
                // User exists but unconfirmed. Delete and re-invite.
                console.log(`[invite-member] User exists but unconfirmed. Deleting and re-inviting.`);
                await supabaseAdmin.from("members").update({ user_id: null }).eq("user_id", existingUser.id);
                await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
                // Proceed to invite logic below...
            }
        }

        // Invite new user via email
        // Use SITE_URL env variable to ensure production URL is used in emails
        const siteUrl = Deno.env.get("SITE_URL") || "https://pulsedeck.de";
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



        // Link the new auth user to all unconnected members IMMEDIATELY
        // This is required because DB triggers might not unreliable or missing for this specific flow
        if (inviteData?.user?.id) {
            // console.log(`[invite-member] Linking new user ${inviteData.user.id} to member ${memberId}`);
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
