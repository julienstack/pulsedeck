import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase';

export const issueTrackerGuard: CanActivateFn = (route, state) => {
    const supabase = inject(SupabaseService);
    const router = inject(Router);
    const ALLOWED_ID = '2d8af6a7-507c-4834-aff9-3b00d1ad9c7c';

    const user = supabase.user();

    if (user?.id === ALLOWED_ID) {
        return true;
    }

    // Check strict equality.
    // Note: user() is a signal, so it might change. Ideally we trust the current value.

    return router.createUrlTree(['/']);
};
