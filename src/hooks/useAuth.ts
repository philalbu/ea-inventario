import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { categoriesService } from "@/services/products.service";

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 8000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setUser(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(timeout);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  const signIn = async (email: string, password: string) => {
    const data = await authService.signIn(email, password);
    if (data.user) {
      await categoriesService.seedDefaults(data.user.id);
    }
    return data;
  };

  const signOut = async () => {
    await authService.signOut();
  };

  return { user, isLoading, signIn, signOut };
}
