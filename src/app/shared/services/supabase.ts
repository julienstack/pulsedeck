import { Injectable, signal } from '@angular/core';
import {
  AuthChangeEvent,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Service for interacting with Supabase
 * Provides authentication, database, storage, and realtime functionality
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session = signal<Session | null>(null);
  private _user = signal<User | null>(null);
  private _authReady = signal(false);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: localStorage,
        },
      }
    );

    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      this._user.set(data.session?.user ?? null);
      this._authReady.set(true);
    });

    this.supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        this._session.set(session);
        this._user.set(session?.user ?? null);
        if (!this._authReady()) {
          this._authReady.set(true);
        }
      }
    );
  }

  /** Get the Supabase client instance */
  get client(): SupabaseClient {
    return this.supabase;
  }

  /** Current session signal (readonly) */
  get session() {
    return this._session.asReadonly();
  }

  /** Current user signal (readonly) */
  get user() {
    return this._user.asReadonly();
  }

  /** Auth initialization complete signal (readonly) */
  get authReady() {
    return this._authReady.asReadonly();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHENTICATION
  // ═══════════════════════════════════════════════════════════════════════════

  /** Sign in with OAuth provider (GitHub, Google, etc.) */
  signInWithOAuth(provider: 'github' | 'google' | 'discord') {
    return this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  /** Sign in with email and password */
  signInWithPassword(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  /** Sign up with email and password */
  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  /** Sign out current user */
  signOut() {
    return this.supabase.auth.signOut();
  }

  /** Reset password for email */
  resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE
  // ═══════════════════════════════════════════════════════════════════════════

  /** Query a table */
  from(table: string) {
    return this.supabase.from(table);
  }

  /** Get the base Supabase URL for building Edge Function URLs */
  getSupabaseUrl(): string {
    return environment.supabase.url;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE
  // ═══════════════════════════════════════════════════════════════════════════

  /** Access a storage bucket */
  storage(bucket: string) {
    return this.supabase.storage.from(bucket);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REALTIME
  // ═══════════════════════════════════════════════════════════════════════════

  /** Subscribe to realtime changes on a table */
  subscribeToTable(table: string, callback: (payload: unknown) => void) {
    return this.supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  }

  /** Unsubscribe from a channel */
  unsubscribe(channel: ReturnType<SupabaseClient['channel']>) {
    return this.supabase.removeChannel(channel);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FEEDBACK
  // ═══════════════════════════════════════════════════════════════════════════

  /** Insert a new feedback submission */
  async insertFeedback(
    type: string,
    description: string,
    userId?: string
  ) {
    return this.supabase.from('feedback_submissions').insert({
      type,
      description,
      user_id: userId,
      status: 'new',
    });
  }

  /** Get all feedback submissions (will fail if RLS verification fails) */
  async getFeedback() {
    return this.supabase
      .from('feedback_submissions')
      .select('*')
      .order('created_at', { ascending: false });
  }
}
