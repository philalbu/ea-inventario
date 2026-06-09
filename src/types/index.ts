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

export interface Responsible {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
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
  baixa_given: boolean;
  baixa_issue: boolean;
  baixa_observation: string | null;
  baixa_quantity: number | null;
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

// ============================================================
// ADMIN: Roles, Permissões, Perfis e Auditoria
// ============================================================

export type RoleName = "super_admin" | "admin" | "operator";

export interface Role {
  id: string;
  name: RoleName;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by: string | null;
  created_at: string;
}

export interface Module {
  id: string;
  name: string;
  label: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface RolePermission {
  id: string;
  role_id: string;
  module_id: string;
  module_name?: string; // ← adiciona
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  created_at: string;
}

export interface UserWithRole extends Profile {
  role: Role | null;
  role_id: string | null;
}

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "VIEW";

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: AuditAction;
  module: string;
  record_id: string | null;
  record_label: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}
