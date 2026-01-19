/**
 * Calendar event interface matching Supabase table structure
 * 
 * Event type is derived from working_group_id:
 * - AG event: working_group_id is set
 * - General event: working_group_id is null
 */
export interface CalendarEvent {
    id?: string;
    organization_id?: string;
    title: string;
    date: string;
    start_time: string;
    end_time?: string | null;
    location: string;
    description?: string | null;
    ag_name?: string | null;
    working_group_id?: string | null;
    created_at?: string;
    updated_at?: string;
    allowed_roles?: string[];
}

/**
 * Helper to determine event type from event data
 */
export function getEventType(event: CalendarEvent): 'general' | 'ag' {
    return event.working_group_id ? 'ag' : 'general';
}
