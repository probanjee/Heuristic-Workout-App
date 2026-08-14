import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function useAuth() {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const utils = trpc.useUtils();

  // tRPC query for the MySQL user record (synced from Supabase user).
  // This only fires when we have a Supabase session.
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!supabaseUser,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
      // Invalidate tRPC auth.me so it re-fetches the MySQL user
      utils.auth.me.invalidate();
    });

    return () => subscription.unsubscribe();
  }, [utils]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
    // Clear legacy session storage
    try {
      sessionStorage.removeItem("fitness-cookie");
    } catch {}
  }, [utils]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    localStorage.setItem(
      "fitness-runtime-user-info",
      JSON.stringify(user)
    );
    return {
      user,
      loading: loading || (!!supabaseUser && meQuery.isLoading),
      error: meQuery.error ?? null,
      isAuthenticated: !!supabaseUser && !!user,
    };
  }, [meQuery.data, meQuery.error, meQuery.isLoading, loading, supabaseUser]);

  return {
    ...state,
    supabaseUser,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
