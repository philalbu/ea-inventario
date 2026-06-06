import { supabase } from "@/lib/supabase";
import type { Responsible } from "@/types";

export const responsiblesService = {
  async getAll(userId: string): Promise<Responsible[]> {
    const { data, error } = await supabase
      .from("responsibles")
      .select("*")
      .eq("user_id", userId)
      .order("name");
    if (error) throw new Error(error.message);
    return (data as Responsible[]) ?? [];
  },

  async create(
    name: string,
    phone: string,
    email: string,
    userId: string,
  ): Promise<Responsible> {
    const { data, error } = await supabase
      .from("responsibles")
      .insert({
        name,
        phone: phone || null,
        email: email || null,
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Responsible;
  },

  async update(
    id: string,
    name: string,
    phone: string,
    email: string,
    userId: string,
  ): Promise<Responsible> {
    const { data, error } = await supabase
      .from("responsibles")
      .update({ name, phone: phone || null, email: email || null })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Responsible;
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("responsibles")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },
};
