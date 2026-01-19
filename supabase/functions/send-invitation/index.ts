import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * send-invitation Edge Function
 * 
 * Called from the public login flow (no auth required).
 * Checks if a member exists with the given email and sends an invitation
 * if the member is not yet connected to an auth user.
 */

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MemberInfo {
    id: string;
    email: string;
    user_id: string | null;
    organization_id: string;
    name: string;
    organization?: {
        id: string;
        name: string;
        slug: string;
    };
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

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

    try {
        const { email, organizationId } = await req.json();

        if (!email) {
            return new Response(
                JSON.stringify({ status: "error", error: "Email is required" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        console.log(`[send-invitation] Checking email: ${normalizedEmail}`);

        // Find all members with this email
        let query = supabaseAdmin
            .from("members")
            .select(`
                id,
                email,
                user_id,
                organization_id,
                name,
                organization:organizations!inner(id, name, slug)
            `)
            .eq("email", normalizedEmail);

        if (organizationId) {
            query = query.eq("organization_id", organizationId);
        }

        const { data: members, error: memberError } = await query;

        if (memberError) {
            console.error("[send-invitation] DB error:", memberError);
            return new Response(
                JSON.stringify({ status: "error", error: "Database error", details: memberError.message }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (!members || members.length === 0) {
            console.log(`[send-invitation] No members found for: ${normalizedEmail}`);
            return new Response(
                JSON.stringify({ status: "not_found" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`[send-invitation] Found ${members.length} member(s)`);

        const connectedMembers = members.filter((m: MemberInfo) => m.user_id !== null);
        const unconnectedMembers = members.filter((m: MemberInfo) => m.user_id === null);

        // All members already connected - user should login with password
        if (connectedMembers.length > 0 && unconnectedMembers.length === 0) {
            console.log(`[send-invitation] All members connected, returning 'connected'`);
            return new Response(
                JSON.stringify({
                    status: "connected",
                    organizations: connectedMembers.map((m: MemberInfo) => ({
                        id: m.organization?.id,
                        name: m.organization?.name,
                        slug: m.organization?.slug,
                    })),
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check if auth user exists by querying auth.users directly
        const { data: existingAuthUsers, error: authLookupError } = await supabaseAdmin
            .from("auth.users")
            .select("id, email")
            .eq("email", normalizedEmail)
            .limit(1);

        // If direct query doesn't work, try the admin API
        let existingUserId: string | null = null;

        if (authLookupError || !existingAuthUsers?.length) {
            // Try admin listUsers as fallback (may be slow)
            try {
                const { data: listData } = await supabaseAdmin.auth.admin.listUsers({
                    perPage: 1000
                });
                const found = listData?.users?.find((u: any) => u.email === normalizedEmail);
                if (found) {
                    existingUserId = found.id;
                }
            } catch (e) {
                console.log("[send-invitation] Could not list users:", e);
            }
        } else if (existingAuthUsers?.length > 0) {
            existingUserId = existingAuthUsers[0].id;
        }

        if (existingUserId) {
            console.log(`[send-invitation] Found existing auth user: ${existingUserId}`);
            // Link unconnected members to existing user
            for (const member of unconnectedMembers) {
                await supabaseAdmin
                    .from("members")
                    .update({ user_id: existingUserId })
                    .eq("id", member.id);
            }

            return new Response(
                JSON.stringify({
                    status: "connected",
                    message: "Existing account linked",
                    organizations: members.map((m: MemberInfo) => ({
                        id: m.organization?.id,
                        name: m.organization?.name,
                        slug: m.organization?.slug,
                    })),
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // No auth user exists - send invitation
        // IMPORTANT: Always use the production URL for email redirects,
        // not the origin header (which could be localhost during local dev)
        const siteUrl = Deno.env.get("SITE_URL") || "https://lexion.app";
        const redirectTo = `${siteUrl}/auth/callback`;

        console.log(`[send-invitation] Sending invite to: ${normalizedEmail}, redirect: ${redirectTo}`);

        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            normalizedEmail,
            {
                redirectTo,
                data: {
                    invited: true,
                    member_ids: members.map((m: MemberInfo) => m.id),
                },
            }
        );

        if (inviteError) {
            console.error("[send-invitation] Invite error:", inviteError);

            // Handle "already registered" edge case
            if (inviteError.message?.includes("already")) {
                return new Response(
                    JSON.stringify({
                        status: "connected",
                        message: "Account exists, please login",
                    }),
                    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            return new Response(
                JSON.stringify({
                    status: "error",
                    error: "Einladung konnte nicht gesendet werden",
                    details: inviteError.message
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Link the new auth user to all unconnected members
        if (inviteData?.user?.id) {
            console.log(`[send-invitation] Linking new user ${inviteData.user.id} to members`);
            for (const member of unconnectedMembers) {
                await supabaseAdmin
                    .from("members")
                    .update({ user_id: inviteData.user.id })
                    .eq("id", member.id);
            }
        }

        console.log("[send-invitation] Invitation sent successfully");
        return new Response(
            JSON.stringify({
                status: "invitation_sent",
                organizations: members.map((m: MemberInfo) => ({
                    id: m.organization?.id,
                    name: m.organization?.name,
                    slug: m.organization?.slug,
                })),
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("[send-invitation] Unexpected error:", error?.message || error);
        return new Response(
            JSON.stringify({
                status: "error",
                error: "Ein unerwarteter Fehler ist aufgetreten",
                details: error?.message || String(error)
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
