/**
 * Calendar event interface matching Supabase table structure
 */
export interface CalendarEvent {
    id?: string;
    organization_id?: string;
    title: string;
    date: string;
    start_time: string;
    end_time?: string | null;
    type: 'general' | 'personal' | 'ag';
    location: string;
    description?: string | null;
    ag_name?: string | null;
    working_group_id?: string | null;
    created_at?: string;
    updated_at?: string;
    allowed_roles?: string[];
}
