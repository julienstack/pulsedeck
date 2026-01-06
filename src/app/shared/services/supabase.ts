import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // TODO: Replace with environment variables
  private supabaseUrl = 'YOUR_SUPABASE_URL';
  private supabaseKey = 'YOUR_SUPABASE_KEY';

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  // Basic Auth Helpers
  async signIn() {
    // Placeholder for auth implementation
    return this.supabase.auth.signInWithOAuth({ provider: 'github' });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }
}
