/**
 * Wiki document interface matching Supabase table structure
 */
export interface WikiDoc {
    id?: string;
    organization_id: string;
    working_group_id?: string;
    title: string;
    description: string;
    content?: string | null;
    last_updated: string;
    author: string;
    category: 'General' | 'Finance' | 'Tech' | 'Legal';
    status: 'Published' | 'Draft' | 'Review';
    created_at?: string;
    updated_at?: string;
    allowed_roles?: string[];
}
