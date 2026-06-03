export interface User {
  id: string
  email: string
  username: string
}

export interface Category {
  id: string
  name: string
  user_id: string
  created_at: string
}

export type ProductStatus = 'active' | 'inactive' | 'low_stock'

export interface Product {
  id: string
  name: string
  quantity: number
  category_id: string | null
  category_name: string | null
  status: ProductStatus
  image_url: string | null
  image_path: string | null
  description: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export interface ProductFormData {
  name: string
  quantity: number
  category_id: string
  category_name?: string
  status: ProductStatus
  description?: string
  image?: FileList
}

export interface CategoryFormData {
  name: string
}

export type ViewMode = 'table' | 'card'

export interface FilterState {
  search: string
  category: string
  status: string
}
