export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
}

export type ProductStatus = "active" | "inactive" | "low_stock";

export interface Product {
  id: string;
  name: string;
  quantity: number;
  category_id: string | null;
  category_name: string | null;
  location_id: string | null;
  location_name: string | null;
  status: ProductStatus;
  image_url: string | null;
  image_path: string | null;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  quantity: number;
  category_id: string;
  category_name?: string;
  location_id?: string;
  location_name?: string;
  status: ProductStatus;
  description?: string;
  image?: FileList;
}

export interface CategoryFormData {
  name: string;
}

export interface LocationFormData {
  name: string;
  description?: string;
}

export type ViewMode = "table" | "card";

export interface FilterState {
  search: string;
  category: string;
  status: string;
}

// EVENTOS
export type EventStatus =
  | "pending"
  | "separating"
  | "separated"
  | "confirming"
  | "completed"
  | "has_issues";

export interface AppEvent {
  id: string;
  name: string;
  event_date: string;
  status: EventStatus;
  notes: string | null;
  responsible_id: string | null;
  responsible_name: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  event_id: string;
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  quantity_requested: number;
  quantity_confirmed: number | null;
  separated: boolean;
  confirmed: boolean;
  missing: boolean;
  missing_justification: string | null;
  user_id: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_image_url: string | null;
  quantity_requested: number;
}

export interface EventFormData {
  name: string;
  event_date: string;
  responsible_id?: string;
  responsible_name?: string;
  notes?: string;
}

export interface Responsible {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  user_id: string;
  created_at: string;
}
