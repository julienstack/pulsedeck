import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase';

/**
 * Skill categories
 */
export type SkillCategory = 'ability' | 'interest' | 'availability';

/**
 * Skill definition (organization-level)
 */
export interface Skill {
    id: string;
    organization_id: string;
    name: string;
    category: SkillCategory;
    icon?: string;
    description?: string;
    sort_order: number;
    created_at?: string;
}

/**
 * Service for managing skills and member skill assignments
 */
@Injectable({
    providedIn: 'root',
})
export class SkillService {
    private readonly supabase = inject(SupabaseService);

    /** All skills for current organization */
    skills = signal<Skill[]>([]);

    /** Loading state */
    loading = signal(false);

    /**
     * Load all skills for an organization
     */
    async loadSkills(organizationId: string): Promise<void> {
        this.loading.set(true);

        const { data, error } = await this.supabase.client
            .from('skills')
            .select('*')
            .eq('organization_id', organizationId)
            .order('category')
            .order('sort_order')
            .order('name');

        if (error) {
            console.error('Error loading skills:', error);
            this.loading.set(false);
            return;
        }

        this.skills.set((data as Skill[]) || []);
        this.loading.set(false);
    }

    /**
     * Get skills grouped by category
     */
    getSkillsByCategory(category: SkillCategory): Skill[] {
        return this.skills().filter((s) => s.category === category);
    }

    /**
     * Load skills assigned to a specific member
     */
    async getMemberSkillIds(memberId: string): Promise<string[]> {
        const { data, error } = await this.supabase.client
            .from('member_skills')
            .select('skill_id')
            .eq('member_id', memberId);

        if (error) {
            console.error('Error loading member skills:', error);
            return [];
        }

        return (data || []).map((ms) => ms.skill_id);
    }

    /**
     * Update skills for a member (replaces all existing)
     */
    async updateMemberSkills(
        memberId: string,
        skillIds: string[]
    ): Promise<boolean> {
        // Delete existing skills
        const { error: deleteError } = await this.supabase.client
            .from('member_skills')
            .delete()
            .eq('member_id', memberId);

        if (deleteError) {
            console.error('Error deleting member skills:', deleteError);
            return false;
        }

        // Insert new skills
        if (skillIds.length > 0) {
            const inserts = skillIds.map((skillId) => ({
                member_id: memberId,
                skill_id: skillId,
            }));

            const { error: insertError } = await this.supabase.client
                .from('member_skills')
                .insert(inserts);

            if (insertError) {
                console.error('Error inserting member skills:', insertError);
                return false;
            }
        }

        return true;
    }

    /**
     * Add a single skill to a member
     */
    async addSkillToMember(
        memberId: string,
        skillId: string
    ): Promise<boolean> {
        const { error } = await this.supabase.client
            .from('member_skills')
            .upsert({ member_id: memberId, skill_id: skillId });

        if (error) {
            console.error('Error adding skill:', error);
            return false;
        }
        return true;
    }

    /**
     * Remove a skill from a member
     */
    async removeSkillFromMember(
        memberId: string,
        skillId: string
    ): Promise<boolean> {
        const { error } = await this.supabase.client
            .from('member_skills')
            .delete()
            .eq('member_id', memberId)
            .eq('skill_id', skillId);

        if (error) {
            console.error('Error removing skill:', error);
            return false;
        }
        return true;
    }

    /**
     * Load all member skills for an organization (bulk load for filtering)
     */
    async getAllMemberSkills(organizationId: string): Promise<Record<string, string[]>> {
        const { data, error } = await this.supabase.client
            .from('member_skills')
            .select('member_id, skill_id, member:members!inner(organization_id)')
            .eq('member.organization_id', organizationId);

        if (error) {
            console.error('Error loading all member skills:', error);
            return {};
        }

        const map: Record<string, string[]> = {};
        if (data) {
            data.forEach((row: any) => {
                const mid = row.member_id;
                if (!map[mid]) map[mid] = [];
                map[mid].push(row.skill_id);
            });
        }
        return map;
    }

    // =========================================================================
    // ADMIN: Skill Management
    // =========================================================================

    /**
     * Create a new skill (admin only)
     */
    async createSkill(
        organizationId: string,
        skill: Partial<Skill>
    ): Promise<Skill | null> {
        const { data, error } = await this.supabase.client
            .from('skills')
            .insert({
                organization_id: organizationId,
                name: skill.name,
                category: skill.category || 'ability',
                icon: skill.icon,
                description: skill.description,
                sort_order: skill.sort_order || 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating skill:', error);
            return null;
        }

        // Refresh skills list
        await this.loadSkills(organizationId);
        return data as Skill;
    }

    /**
     * Update a skill (admin only)
     */
    async updateSkill(
        skillId: string,
        updates: Partial<Skill>
    ): Promise<boolean> {
        const { error } = await this.supabase.client
            .from('skills')
            .update({
                name: updates.name,
                category: updates.category,
                icon: updates.icon,
                description: updates.description,
                sort_order: updates.sort_order,
                updated_at: new Date().toISOString(),
            })
            .eq('id', skillId);

        if (error) {
            console.error('Error updating skill:', error);
            return false;
        }
        return true;
    }

    /**
     * Delete a skill (admin only)
     */
    async deleteSkill(skillId: string): Promise<boolean> {
        const { error } = await this.supabase.client
            .from('skills')
            .delete()
            .eq('id', skillId);

        if (error) {
            console.error('Error deleting skill:', error);
            return false;
        }
        return true;
    }

    // =========================================================================
    // ADMIN: Member Filtering
    // =========================================================================

    /**
     * Find members with specific skills
     */
    async findMembersBySkills(
        organizationId: string,
        skillIds: string[]
    ): Promise<
        Array<{
            member_id: string;
            member_name: string;
            member_email: string;
            matching_skills: number;
        }>
    > {
        const { data, error } = await this.supabase.client.rpc(
            'get_members_by_skills',
            {
                org_uuid: organizationId,
                skill_ids: skillIds,
            }
        );

        if (error) {
            console.error('Error finding members by skills:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Get category label in German
     */
    getCategoryLabel(category: SkillCategory): string {
        const labels: Record<SkillCategory, string> = {
            ability: 'Fähigkeiten',
            interest: 'Interessen',
            availability: 'Verfügbarkeit',
        };
        return labels[category] || category;
    }

    /**
     * Get category icon
     */
    getCategoryIcon(category: SkillCategory): string {
        const icons: Record<SkillCategory, string> = {
            ability: 'pi-wrench',
            interest: 'pi-heart',
            availability: 'pi-clock',
        };
        return icons[category] || 'pi-tag';
    }
}
