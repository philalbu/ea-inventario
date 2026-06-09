import { supabase } from "@/lib/supabase";
import { storageService } from "./storage.service";
import { auditService } from "./admin.service";
import type { Product, ProductFormData, Category, Location } from "@/types";

export const productsService = {
  async getAll(
    page = 0,
    limit = 12,
  ): Promise<{ data: Product[]; hasMore: boolean }> {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    const total = count ?? 0;
    return {
      data: (data as Product[]) ?? [],
      hasMore: from + limit < total,
    };
  },

  async getAllForSelect(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, quantity, image_url, category_name, location_name")
      .order("name");
    if (error) throw new Error(error.message);
    return (data as Product[]) ?? [];
  },

  async getStats(): Promise<{
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  }> {
    const { count: total } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    const { count: active } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    const { count: outOfStock } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("quantity", 0);
    const { count: lowStock } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gt("quantity", 0)
      .lte("quantity", 5);

    return {
      total: total ?? 0,
      active: active ?? 0,
      lowStock: lowStock ?? 0,
      outOfStock: outOfStock ?? 0,
    };
  },

  async create(
    formData: ProductFormData,
    userId: string,
    userEmail: string,
  ): Promise<Product> {
    let imageUrl: string | null = null;
    let imagePath: string | null = null;
    if (formData.image && formData.image.length > 0) {
      const result = await storageService.uploadImage(
        formData.image[0],
        userId,
      );
      imageUrl = result.url;
      imagePath = result.path;
    }
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: formData.name,
        quantity: formData.quantity,
        category_id: formData.category_id || null,
        category_name: formData.category_name || null,
        location_id: formData.location_id || null,
        location_name: formData.location_name || null,
        status: formData.status,
        description: formData.description || null,
        image_url: imageUrl,
        image_path: imagePath,
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await auditService.log({
      userId,
      userEmail,
      action: "CREATE",
      module: "products",
      recordId: (data as Product).id,
      recordLabel: formData.name,
      newData: {
        name: formData.name,
        quantity: formData.quantity,
        status: formData.status,
      },
    });

    return data as Product;
  },

  async update(
    id: string,
    formData: Partial<ProductFormData>,
    userId: string,
    userEmail: string,
    currentImagePath?: string | null,
  ): Promise<Product> {
    let imageUrl: string | undefined;
    let imagePath: string | undefined;
    if (formData.image && formData.image.length > 0) {
      if (currentImagePath)
        await storageService.deleteImage(currentImagePath).catch(() => null);
      const result = await storageService.uploadImage(
        formData.image[0],
        userId,
      );
      imageUrl = result.url;
      imagePath = result.path;
    }
    const updatePayload: Record<string, unknown> = {
      name: formData.name,
      quantity: formData.quantity,
      category_id: formData.category_id || null,
      category_name: formData.category_name || null,
      location_id: formData.location_id || null,
      location_name: formData.location_name || null,
      status: formData.status,
      description: formData.description || null,
    };
    if (imageUrl) {
      updatePayload.image_url = imageUrl;
      updatePayload.image_path = imagePath;
    }
    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await auditService.log({
      userId,
      userEmail,
      action: "UPDATE",
      module: "products",
      recordId: id,
      recordLabel: formData.name,
      newData: {
        name: formData.name,
        quantity: formData.quantity,
        status: formData.status,
      },
    });

    return data as Product;
  },

  async delete(
    id: string,
    userId: string,
    userEmail: string,
    imagePath?: string | null,
    productName?: string,
  ): Promise<void> {
    if (imagePath)
      await storageService.deleteImage(imagePath).catch(() => null);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);

    await auditService.log({
      userId,
      userEmail,
      action: "DELETE",
      module: "products",
      recordId: id,
      recordLabel: productName,
    });
  },
};

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return (data as Category[]) ?? [];
  },

  async create(name: string, userId: string): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Category;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async seedDefaults(userId: string): Promise<void> {
    const defaults = [
      "Eletrônicos",
      "Alimentos",
      "Bebidas",
      "Higiene",
      "Limpeza",
      "Outros",
    ];
    const { data: existing } = await supabase
      .from("categories")
      .select("name")
      .limit(1);
    if (existing && existing.length > 0) return;
    await supabase
      .from("categories")
      .insert(defaults.map((name) => ({ name, user_id: userId })));
  },
};

export const locationsService = {
  async getAll(): Promise<Location[]> {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("name");
    if (error) throw new Error(error.message);
    return (data as Location[]) ?? [];
  },

  async create(
    name: string,
    description: string,
    userId: string,
  ): Promise<Location> {
    const { data, error } = await supabase
      .from("locations")
      .insert({ name, description: description || null, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Location;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
