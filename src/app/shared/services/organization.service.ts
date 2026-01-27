import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase';

export type SubscriptionTier = 'free' | 'pro' | 'pro_bono';

export interface Organization {
    id: string;
    slug: string;
    name: string;
    description?: string;
    logo_url?: string;
    primary_color: string;
    subscription_tier: SubscriptionTier;
    max_members: number;
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
    private supabase = inject(SupabaseService);
    private router = inject(Router);

    // Current organization context
    currentOrganization = signal<Organization | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    // Derived signals
    currentSlug = computed(() => this.currentOrganization()?.slug);
    currentOrgId = computed(() => this.currentOrganization()?.id);
    isLoaded = computed(() => this.currentOrganization() !== null);

    /**
     * Load organization by slug
     */
    async loadBySlug(slug: string): Promise<boolean> {
        this.loading.set(true);
        this.error.set(null);

        const { data, error } = await this.supabase.client
            .from('organizations')
            .select('*')
            .eq('slug', slug)
            .single();

        this.loading.set(false);

        if (error || !data) {
            this.error.set('Organisation nicht gefunden');
            this.currentOrganization.set(null);
            return false;
        }

        this.currentOrganization.set(data as Organization);
        return true;
    }

    /**
     * Create a new organization
     * Also adds the owner as an admin member
     */
    async create(
        name: string,
        slug: string,
        ownerId: string
    ): Promise<Organization> {
        // Validate slug
        const cleanSlug = this.slugify(slug);

        const { data, error } = await this.supabase.client
            .from('organizations')
            .insert({
                name,
                slug: cleanSlug,
                owner_id: ownerId,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new Error('Diese URL ist bereits vergeben');
            }
            throw new Error(error.message);
        }

        const org = data as Organization;

        // Get user email for member creation
        const { data: { user } } = await this.supabase.client.auth.getUser();

        // Add owner as admin member
        const { error: memberError } = await this.supabase.client
            .from('members')
            .insert({
                name: user?.email?.split('@')[0] || 'Admin',
                email: user?.email || '',
                user_id: ownerId,
                organization_id: org.id,
                app_role: 'admin',
                role: 'Admin',
                status: 'Active',
                join_date: new Date().toLocaleDateString('de-DE'),
            });

        if (memberError) {
            console.error('Failed to create owner member:', memberError);
            // Don't throw - org was created, member can be added later
        }

        return org;
    }

    /**
     * Update organization settings
     */
    async update(
        id: string,
        updates: Partial<Organization>
    ): Promise<void> {
        const { error } = await this.supabase.client
            .from('organizations')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw new Error(error.message);

        // Refresh current organization
        const current = this.currentOrganization();
        if (current?.id === id) {
            this.currentOrganization.set({ ...current, ...updates });
        }
    }

    /**
     * Check if slug is available
     */
    async isSlugAvailable(slug: string): Promise<boolean> {
        const cleanSlug = this.slugify(slug);

        const { data } = await this.supabase.client
            .from('organizations')
            .select('id')
            .eq('slug', cleanSlug)
            .single();

        return !data;
    }

    /**
     * Get organizations for current user
     */
    async getMyOrganizations(userId: string): Promise<Organization[]> {
        // Get organizations where user is owner
        const { data: owned } = await this.supabase.client
            .from('organizations')
            .select('*')
            .eq('owner_id', userId);

        // Get organizations where user is a member
        const { data: memberOf } = await this.supabase.client
            .from('members')
            .select('organization_id')
            .eq('user_id', userId)
            .not('organization_id', 'is', null);

        const memberOrgIds = memberOf?.map(m => m.organization_id) || [];

        // Fetch those organizations
        let memberOrgs: Organization[] = [];
        if (memberOrgIds.length > 0) {
            const { data } = await this.supabase.client
                .from('organizations')
                .select('*')
                .in('id', memberOrgIds);
            memberOrgs = data as Organization[] || [];
        }

        // Combine and dedupe
        const allOrgs = [...(owned || []), ...memberOrgs];
        const unique = allOrgs.filter(
            (org, index, self) => self.findIndex(o => o.id === org.id) === index
        );

        return unique as Organization[];
    }

    /**
     * Get member count for organization
     */
    async getMemberCount(organizationId: string): Promise<number> {
        const { count } = await this.supabase.client
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', organizationId);

        return count ?? 0;
    }

    /**
     * Check if organization can add more members
     */
    async canAddMember(organizationId: string): Promise<boolean> {
        const org = this.currentOrganization();
        if (!org) return false;

        // Pro and pro_bono have unlimited members
        if (org.subscription_tier !== 'free') return true;

        const currentCount = await this.getMemberCount(organizationId);
        return currentCount < org.max_members;
    }

    /**
     * Navigate to organization dashboard
     */
    navigateToDashboard(slug?: string): void {
        const s = slug || this.currentSlug();
        if (s) {
            this.router.navigate(['/', s, 'dashboard']);
        }
    }

    /**
     * Convert string to URL-friendly slug
     */
    private slugify(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[äÄ]/g, 'ae')
            .replace(/[öÖ]/g, 'oe')
            .replace(/[üÜ]/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Get subscription tier label
     */
    getTierLabel(tier: SubscriptionTier): string {
        const labels: Record<SubscriptionTier, string> = {
            free: 'Free (bis 10 Mitglieder)',
            pro: 'Pro',
            pro_bono: 'Pro Bono (gemeinnützig)',
        };
        return labels[tier];
    }
}
