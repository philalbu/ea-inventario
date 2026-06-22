import { supabase } from "@/lib/supabase";

export const authService = {
  async signIn(username: string, password: string) {
    // Busca o email pelo username na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email")
      .eq("username", username)
      .single();

    if (profileError || !profile?.email) {
      throw new Error("Usuário ou senha inválidos");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (error) throw new Error("Usuário ou senha inválidos");
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
