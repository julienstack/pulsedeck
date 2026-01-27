// iCal Export Edge Function
// Generates .ics file for calendar subscription
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Format a date/time to iCal format (YYYYMMDDTHHMMSS)
 */
function formatICalDate(date: string, time?: string): string {
    const d = new Date(date);
    if (time) {
        const [hours, minutes] = time.split(':');
        d.setHours(parseInt(hours), parseInt(minutes), 0);
    }
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escape special characters for iCal text fields
 */
function escapeICalText(text: string): string {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

/**
 * Generate iCal content from events
 */
function generateICalContent(events: any[], calendarName: string = 'PulseDeck'): string {
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PulseDeck//Vereinsverwaltung//DE
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${calendarName}
X-WR-TIMEZONE:Europe/Berlin
`;

    for (const event of events) {
        const uid = `${event.id}@pulsedeck.de`;
        const dtStart = formatICalDate(event.date, event.start_time);
        const dtEnd = event.end_time
            ? formatICalDate(event.date, event.end_time)
            : formatICalDate(event.date, event.start_time); // Fallback: same as start

        const summary = escapeICalText(event.title);
        const description = escapeICalText(event.description || '');
        const location = escapeICalText(event.location || '');

        ical += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${summary}
`;

        if (description) {
            ical += `DESCRIPTION:${description}\n`;
        }
        if (location) {
            ical += `LOCATION:${location}\n`;
        }
        if (event.ag_name) {
            ical += `CATEGORIES:${escapeICalText(event.ag_name)}\n`;
        }

        ical += `END:VEVENT\n`;
    }

    ical += `END:VCALENDAR`;

    return ical;
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Use Service Role to bypass RLS and perform manual checks
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Parse query params
        const url = new URL(req.url);
        const token = url.searchParams.get('token');
        let orgId = url.searchParams.get('org');
        const filterAgId = url.searchParams.get('ag'); // Optional: filter by AG
        const download = url.searchParams.get('download') !== 'false';

        // Context Data
        let userRoles = ['public'];
        let agIds: string[] = [];

        // 1. Authenticate via Token (Preferred) or Fallback to Public/Org
        if (token) {
            const { data: member, error } = await supabaseClient
                .from('members')
                .select('id, organization_id, app_role')
                .eq('calendar_token', token)
                .single();

            if (error || !member) {
                return new Response("Invalid Calendar Token", { status: 401, headers: corsHeaders });
            }

            // Identify Org and User Context
            orgId = member.organization_id;
            userRoles.push('member');
            if (member.app_role) {
                userRoles.push(member.app_role);
            }

            // Fetch AG memberships for visibility
            const { data: agMemberships } = await supabaseClient
                .from('ag_memberships')
                .select('working_group_id')
                .eq('member_id', member.id);

            if (agMemberships) {
                agIds = agMemberships.map(m => m.working_group_id);
            }
        } else if (!orgId) {
            return new Response("Organization ID or Token is required", { status: 400, headers: corsHeaders });
        }

        // 2. Build Query
        let query = supabaseClient
            .from('events')
            .select('*')
            .eq('organization_id', orgId)
            .order('date', { ascending: true });

        // 3. Apply Filters

        // AG Filter (explicit)
        if (filterAgId) {
            query = query.eq('working_group_id', filterAgId);
        }

        // Time Filter (optimize)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

        // 4. Visibility Filter (The Core Logic)
        // Event is visible if:
        // (allowed_roles overlaps userRoles) OR (working_group_id IN agIds)

        let visibilityFilter = `allowed_roles.ov.{${userRoles.join(',')}}`;
        if (agIds.length > 0) {
            visibilityFilter += `,working_group_id.in.(${agIds.join(',')})`;
        }

        // Apply OR filter to check visibility
        query = query.or(visibilityFilter);

        // Execute
        const { data: events, error } = await query;

        if (error) {
            throw new Error(error.message);
        }

        // Get calendar name
        let calendarName = 'PulseDeck Kalender';
        if (filterAgId) {
            const { data: ag } = await supabaseClient
                .from('working_groups')
                .select('name')
                .eq('id', filterAgId)
                .single();
            if (ag) calendarName = `PulseDeck - ${ag.name}`;
        } else if (orgId) {
            // Try to fetch org name? Not critical.
        }

        // Generate iCal content
        const icalContent = generateICalContent(events || [], calendarName);

        // Return as .ics file
        const headers = {
            ...corsHeaders,
            "Content-Type": "text/calendar; charset=utf-8",
        };

        if (download) {
            headers["Content-Disposition"] = `attachment; filename="${calendarName.replace(/\s+/g, '_')}.ics"`;
        }

        return new Response(icalContent, { headers });

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
        );
    }
});
