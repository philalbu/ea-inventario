import { supabase } from "@/lib/supabase";
import type { AppEvent, EventItem, EventFormData, CartItem } from "@/types";

export const eventsService = {
  async getAll(userId: string): Promise<AppEvent[]> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .order("event_date", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as AppEvent[]) ?? [];
  },

  async getById(id: string, userId: string): Promise<AppEvent> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    if (error) throw new Error(error.message);
    return data as AppEvent;
  },

  async create(
    formData: EventFormData,
    items: CartItem[],
    userId: string,
  ): Promise<AppEvent> {
    const { data: event, error } = await supabase
      .from("events")
      .insert({
        name: formData.name,
        event_date: formData.event_date,
        notes: formData.notes || null,
        status: "pending",
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (items.length > 0) {
      const { error: itemsError } = await supabase.from("event_items").insert(
        items.map((item) => ({
          event_id: event.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image_url: item.product_image_url,
          quantity_requested: item.quantity_requested,
          user_id: userId,
        })),
      );
      if (itemsError) throw new Error(itemsError.message);
    }
    return event as AppEvent;
  },

  async update(
    id: string,
    formData: { name: string; event_date: string; notes?: string },
    userId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("events")
      .update({
        name: formData.name,
        event_date: formData.event_date,
        notes: formData.notes || null,
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  async updateStatus(
    id: string,
    status: string,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("events")
      .update({ status })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  async processBaixa(
    eventId: string,
    userId: string,
    baixaItems: {
      itemId: string;
      productId: string;
      quantity: number;
      isIssue: boolean;
      observation?: string;
    }[],
  ): Promise<void> {
    for (const b of baixaItems) {
      if (b.isIssue) {
        // Marca como problema
        await supabase
          .from("event_items")
          .update({
            baixa_given: false,
            baixa_issue: true,
            baixa_observation: b.observation || null,
            baixa_quantity: b.quantity,
          })
          .eq("id", b.itemId);
      } else {
        // Deduz do estoque
        const { data: product } = await supabase
          .from("products")
          .select("quantity")
          .eq("id", b.productId)
          .single();

        if (product) {
          const newQty = Math.max(0, product.quantity - b.quantity);
          await supabase
            .from("products")
            .update({ quantity: newQty })
            .eq("id", b.productId);
        }

        await supabase
          .from("event_items")
          .update({
            baixa_given: true,
            baixa_issue: false,
            baixa_quantity: b.quantity,
          })
          .eq("id", b.itemId);

        // Registra movimentação
        await supabase.from("stock_movements").insert({
          event_id: eventId,
          product_id: b.productId,
          product_name: "",
          quantity_deducted: b.quantity,
          user_id: userId,
        });
      }
    }

    // Verifica se todos os itens foram processados
    const { data: allItems } = await supabase
      .from("event_items")
      .select("baixa_given, baixa_issue")
      .eq("event_id", eventId);

    const allProcessed = allItems?.every((i) => i.baixa_given || i.baixa_issue);
    const hasIssues = allItems?.some((i) => i.baixa_issue);

    if (allProcessed) {
      const newStatus = hasIssues ? "has_issues" : "completed";
      await eventsService.updateStatus(eventId, newStatus, userId);
    }
  },
};

export const eventItemsService = {
  async getByEvent(eventId: string): Promise<EventItem[]> {
    const { data, error } = await supabase
      .from("event_items")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at");
    if (error) throw new Error(error.message);
    return (data as EventItem[]) ?? [];
  },

  async addItems(
    eventId: string,
    items: CartItem[],
    userId: string,
  ): Promise<void> {
    const { error } = await supabase.from("event_items").insert(
      items.map((item) => ({
        event_id: eventId,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image_url: item.product_image_url,
        quantity_requested: item.quantity_requested,
        user_id: userId,
      })),
    );
    if (error) throw new Error(error.message);
  },

  async updateQuantity(id: string, quantity_requested: number): Promise<void> {
    const { error } = await supabase
      .from("event_items")
      .update({ quantity_requested })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase.from("event_items").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async toggleSeparated(id: string, separated: boolean): Promise<void> {
    const { error } = await supabase
      .from("event_items")
      .update({ separated })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  async confirmItem(id: string, quantity_confirmed: number): Promise<void> {
    const { error } = await supabase
      .from("event_items")
      .update({
        confirmed: true,
        missing: false,
        missing_justification: null,
        quantity_confirmed,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  async markMissing(id: string, justification: string): Promise<void> {
    const { error } = await supabase
      .from("event_items")
      .update({
        missing: true,
        confirmed: false,
        missing_justification: justification,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },

  async resolveMissing(id: string, quantity_confirmed: number): Promise<void> {
    const { error } = await supabase
      .from("event_items")
      .update({
        missing: false,
        confirmed: true,
        missing_justification: null,
        quantity_confirmed,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);
  },
};
