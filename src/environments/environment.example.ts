/**
 * Example environment configuration
 * Copy this file to environment.ts and environment.prod.ts
 * and replace the placeholder values with your actual Supabase credentials
 */
export const environment = {
    production: false,
    supabase: {
        url: 'YOUR_SUPABASE_PROJECT_URL',
        anonKey: 'YOUR_SUPABASE_ANON_KEY',
    },
};
