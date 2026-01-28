import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { OrganizationService } from './organization.service';
import { AuthService } from './auth.service';

/**
 * A matched opportunity for the current member
 */
export interface MatchedOpportunity {
    slot_id: string;
    slot_title: string;
    event_id: string;
    event_title: string;
    event_date: string;
    event_location?: string;
    matching_skills: string[];
    has_skill_match: boolean;
    remaining_spots: number;
}

/**
 * Service for Smart Matching - finds open helper slots for the member
 */
@Injectable({
    providedIn: 'root',
})
export class SmartMatchingService {
    private readonly supabase = inject(SupabaseService);
    private readonly orgService = inject(OrganizationService);
    private readonly authService = inject(AuthService);

    /** Matched opportunities for current member */
    opportunities = signal<MatchedOpportunity[]>([]);

    /** Loading state */
    loading = signal(false);

    /** Whether the member has any skills tagged */
    hasSkills = signal(false);

    /**
     * Find open helper slots for the current member
     * Shows all relevant slots, highlights those matching skills
     */
    async findMatchingOpportunities(): Promise<void> {
        const memberId = this.authService.currentMember()?.id;
        const orgId = this.orgService.currentOrgId();

        if (!memberId || !orgId) {
            this.opportunities.set([]);
            return;
        }

        this.loading.set(true);

        try {
            // 1. Get member's skills (for highlighting)
            const { data: memberSkills } = await this.supabase.client
                .from('member_skills')
                .select('skill_id')
                .eq('member_id', memberId);

            const memberSkillIds = (memberSkills || []).map((s) => s.skill_id);
            this.hasSkills.set(memberSkillIds.length > 0);

            // 2. Get member's AG memberships
            const { data: agMemberships } = await this.supabase.client
                .from('ag_memberships')
                .select('working_group_id')
                .eq('member_id', memberId);

            const myAgIds = (agMemberships || []).map((m) => m.working_group_id);

            // 3. Find open slots from upcoming events in this org
            const today = new Date().toISOString().split('T')[0];

            const { data: slots, error: slotsError } =
                await this.supabase.client
                    .from('event_slots')
                    .select(`
                        id,
                        title,
                        max_helpers,
                        required_skills,
                        event:events!inner(
                            id,
                            title,
                            date,
                            location,
                            organization_id,
                            working_group_id,
                            allowed_roles
                        ),
                        signups:event_slot_signups(count)
                    `)
                    .eq('event.organization_id', orgId)
                    .gte('event.date', today);

            if (slotsError) {
                console.error('Error loading slots:', slotsError);
                this.opportunities.set([]);
                this.loading.set(false);
                return;
            }

            // 4. Filter and map to MatchedOpportunity
            const matched: MatchedOpportunity[] = [];

            for (const slot of slots || []) {
                // Type the event from the join
                const eventData = slot.event as unknown as {
                    id: string;
                    title: string;
                    date: string;
                    location?: string;
                    working_group_id?: string;
                    allowed_roles?: string[];
                };

                // Check if event is relevant (public or member's AG)
                const isPublic =
                    eventData.allowed_roles?.includes('public') ||
                    eventData.allowed_roles?.includes('member');
                const isMyAg =
                    eventData.working_group_id &&
                    myAgIds.includes(eventData.working_group_id);

                if (!isPublic && !isMyAg) {
                    continue;
                }

                // Check capacity
                const signupCount =
                    (slot.signups as { count: number }[])?.[0]?.count || 0;
                const remainingSpots = slot.max_helpers - signupCount;

                if (remainingSpots <= 0) {
                    continue;
                }

                // Check if member is already signed up
                const { data: existingSignup } = await this.supabase.client
                    .from('event_slot_signups')
                    .select('id')
                    .eq('slot_id', slot.id)
                    .eq('member_id', memberId)
                    .eq('status', 'confirmed')
                    .maybeSingle();

                if (existingSignup) {
                    continue;
                }

                // Check for skill matches (if slot has required_skills)
                let matchingSkillNames: string[] = [];
                let hasSkillMatch = false;

                if (
                    slot.required_skills &&
                    slot.required_skills.length > 0 &&
                    memberSkillIds.length > 0
                ) {
                    const matchingSkillIds = slot.required_skills.filter(
                        (reqSkill: string) => memberSkillIds.includes(reqSkill)
                    );

                    if (matchingSkillIds.length > 0) {
                        hasSkillMatch = true;
                        // Get skill names for display
                        const { data: skillNames } = await this.supabase.client
                            .from('skills')
                            .select('name')
                            .in('id', matchingSkillIds);
                        matchingSkillNames = (skillNames || []).map(
                            (s) => s.name
                        );
                    }
                }

                matched.push({
                    slot_id: slot.id,
                    slot_title: slot.title,
                    event_id: eventData.id,
                    event_title: eventData.title,
                    event_date: eventData.date,
                    event_location: eventData.location,
                    matching_skills: matchingSkillNames,
                    has_skill_match: hasSkillMatch,
                    remaining_spots: remainingSpots,
                });
            }

            // Sort: skill matches first, then by date
            matched.sort((a, b) => {
                // Skill matches first
                if (a.has_skill_match && !b.has_skill_match) return -1;
                if (!a.has_skill_match && b.has_skill_match) return 1;
                // Then by date
                return (
                    new Date(a.event_date).getTime() -
                    new Date(b.event_date).getTime()
                );
            });

            // Limit to top 3
            this.opportunities.set(matched.slice(0, 3));
        } catch (error) {
            console.error('Error in smart matching:', error);
            this.opportunities.set([]);
        }

        this.loading.set(false);
    }
}
