import { supabase } from '@/lib/supabase'
import { storageService } from './storage.service'
import type { Product, ProductFormData, Category } from '@/types'

export const productsService = {
  async getAll(userId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as Product[]) ?? []
  },

  async create(formData: ProductFormData, userId: string): Promise<Product> {
    let imageUrl: string | null = null
    let imagePath: string | null = null

    if (formData.image && formData.image.length > 0) {
      const result = await storageService.uploadImage(formData.image[0], userId)
      imageUrl = result.url
      imagePath = result.path
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: formData.name,
        quantity: formData.quantity,
        category_id: formData.category_id || null,
        category_name: formData.category_name || null,
        status: formData.status,
        description: formData.description || null,
        image_url: imageUrl,
        image_path: imagePath,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Product
  },

  async update(
    id: string,
    formData: Partial<ProductFormData>,
    userId: string,
    currentImagePath?: string | null
  ): Promise<Product> {
    let imageUrl: string | undefined
    let imagePath: string | undefined

    if (formData.image && formData.image.length > 0) {
      if (currentImagePath) {
        await storageService.deleteImage(currentImagePath).catch(() => null)
      }
      const result = await storageService.uploadImage(formData.image[0], userId)
      imageUrl = result.url
      imagePath = result.path
    }

    const updatePayload: Record<string, unknown> = {
      name: formData.name,
      quantity: formData.quantity,
      category_id: formData.category_id || null,
      category_name: formData.category_name || null,
      status: formData.status,
      description: formData.description || null,
    }

    if (imageUrl) {
      updatePayload.image_url = imageUrl
      updatePayload.image_path = imagePath
    }

    const { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Product
  },

  async delete(id: string, userId: string, imagePath?: string | null): Promise<void> {
    if (imagePath) {
      await storageService.deleteImage(imagePath).catch(() => null)
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  },
}

export const categoriesService = {
  async getAll(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (error) throw new Error(error.message)
    return (data as Category[]) ?? []
  },

  async create(name: string, userId: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, user_id: userId })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Category
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)
  },

  async seedDefaults(userId: string): Promise<void> {
    const defaults = ['Eletrônicos', 'Alimentos', 'Bebidas', 'Higiene', 'Limpeza', 'Outros']
    await supabase.from('categories').upsert(
      defaults.map((name) => ({ name, user_id: userId })),
      { onConflict: 'name,user_id', ignoreDuplicates: true }
    )
  },
}
