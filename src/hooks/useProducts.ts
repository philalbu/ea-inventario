import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService, categoriesService } from '@/services/products.service'
import { useAuthStore } from '@/store/auth.store'
import type { ProductFormData } from '@/types'

const PRODUCTS_KEY = 'products'
const CATEGORIES_KEY = 'categories'

export function useProducts() {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const products = useQuery({
    queryKey: [PRODUCTS_KEY, user?.id],
    queryFn: () => productsService.getAll(user!.id),
    enabled: !!user,
  })

  const categories = useQuery({
    queryKey: [CATEGORIES_KEY, user?.id],
    queryFn: () => categoriesService.getAll(user!.id),
    enabled: !!user,
  })

  const createProduct = useMutation({
    mutationFn: (data: ProductFormData) => productsService.create(data, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  })

  const updateProduct = useMutation({
    mutationFn: ({
      id,
      data,
      currentImagePath,
    }: {
      id: string
      data: Partial<ProductFormData>
      currentImagePath?: string | null
    }) => productsService.update(id, data, user!.id, currentImagePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  })

  const deleteProduct = useMutation({
    mutationFn: ({ id, imagePath }: { id: string; imagePath?: string | null }) =>
      productsService.delete(id, user!.id, imagePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  })

  const createCategory = useMutation({
    mutationFn: (name: string) => categoriesService.create(name, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  })

  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoriesService.delete(id, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  })

  return {
    products: products.data ?? [],
    categories: categories.data ?? [],
    isLoadingProducts: products.isLoading,
    isLoadingCategories: categories.isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    deleteCategory,
  }
}
