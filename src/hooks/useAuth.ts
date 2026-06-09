import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { categoriesService } from "@/services/products.service";
import { auditService } from "@/services/admin.service";

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
      await auditService.log({
        userId: data.user.id,
        userEmail: email,
        action: "LOGIN",
        module: "auth",
        recordLabel: "Login no sistema",
      });
    }
    return data;
  };

  const signOut = async () => {
    if (user) {
      await auditService.log({
        userId: user.id,
        userEmail: user.email ?? "",
        action: "LOGOUT",
        module: "auth",
        recordLabel: "Logout do sistema",
      });
    }
    await authService.signOut();
  };

  return { user, isLoading, signIn, signOut };
}
