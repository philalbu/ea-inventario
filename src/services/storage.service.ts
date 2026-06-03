import { supabase } from '@/lib/supabase'

const BUCKET = 'product-images'

export const storageService = {
  async uploadImage(file: File, userId: string): Promise<{ url: string; path: string }> {
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) throw new Error(`Erro ao fazer upload: ${error.message}`)

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { url: data.publicUrl, path }
  },

  async deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage.from(BUCKET).remove([path])
    if (error) throw new Error(`Erro ao deletar imagem: ${error.message}`)
  },
}
