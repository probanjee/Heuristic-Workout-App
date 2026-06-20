/**
 * File: lib/auth.ts
 * Purpose: Authentication layer providing user session management
 * Dependencies: lib/supabase, @supabase/supabase-js
 */

import { supabase } from './supabase';
import { AuthError, Session, User } from '@supabase/supabase-js';

/**
 * Sign up a new user with email and password
 * @param email User email
 * @param password User password
 * @returns Object with data or error
 */
export async function signUp(email: string, password: string): Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }> {
  return await supabase.auth.signUp({ email, password });
}

/**
 * Sign in an existing user with email and password
 * @param email User email
 * @param password User password
 * @returns Object with data or error
 */
export async function signIn(email: string, password: string): Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }> {
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign out the current user
 * @returns Object with error if any
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  return await supabase.auth.signOut();
}

/**
 * Get the currently authenticated user
 * @returns The User object or null
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session
 * @returns The Session object or null
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Refresh the current authentication session
 * @returns Object with data or error
 */
export async function refreshSession(): Promise<{ data: { user: User | null; session: Session | null }; error: AuthError | null }> {
  return await supabase.auth.refreshSession();
}
