import { create } from "zustand";
import type { RoleName, RolePermission } from "@/types";

interface PermissionState {
  role: RoleName | null;
  permissions: RolePermission[];
  isLoading: boolean;
  setRole: (role: RoleName | null) => void;
  setPermissions: (permissions: RolePermission[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  canAccess: (module: string) => boolean;
  hasPermission: (
    module: string,
    action: "view" | "create" | "update" | "delete",
  ) => boolean;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  role: null,
  permissions: [],
  isLoading: true,

  setRole: (role) => set({ role }),
  setPermissions: (permissions) => set({ permissions }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ role: null, permissions: [], isLoading: true }),

  isSuperAdmin: () => get().role === "super_admin",
  isAdmin: () => get().role === "super_admin" || get().role === "admin",

  canAccess: (module: string) => {
    const { role, permissions } = get();
    if (role === "super_admin") return true;
    const perm = permissions.find((p) => p.module_name === module);
    return perm?.can_view ?? false;
  },

  hasPermission: (
    module: string,
    action: "view" | "create" | "update" | "delete",
  ) => {
    const { role, permissions } = get();
    if (role === "super_admin") return true;
    const perm = permissions.find((p) => p.module_name === module);
    if (!perm) return false;
    const map = {
      view: perm.can_view,
      create: perm.can_create,
      update: perm.can_update,
      delete: perm.can_delete,
    };
    return map[action];
  },
}));
