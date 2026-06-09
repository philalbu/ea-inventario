import { supabase } from "@/lib/supabase";
import type {
  Role,
  Module,
  RolePermission,
  Profile,
  UserWithRole,
  AuditLog,
  AuditAction,
  RoleName,
} from "@/types";

// ============================================================
// PERFIS
// ============================================================
export const profilesService = {
  async getAll(): Promise<UserWithRole[]> {
    // Busca perfis
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");
    if (error) throw new Error(error.message);

    // Busca user_roles separado
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(
        "user_id, role_id, roles(id, name, description, is_system, created_at)",
      );

    return (profiles ?? []).map((p: any) => {
      const ur = (userRoles ?? []).find((r: any) => r.user_id === p.id);
      return {
        ...p,
        role_id: ur?.role_id ?? null,
        role: ur?.roles ?? null,
      };
    });
  },

  async getMyProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data as Profile | null;
  },

  async getMyRole(userId: string): Promise<RoleName | null> {
    const { data } = await supabase
      .from("user_roles")
      .select("roles(name)")
      .eq("user_id", userId)
      .single();
    return (data as any)?.roles?.name ?? null;
  },

  async createUser(params: {
    full_name: string;
    username: string;
    email: string;
    password: string;
    role_name: RoleName;
  }): Promise<void> {
    const { error } = await supabase.rpc("create_user_with_profile", {
      p_email: params.email,
      p_password: params.password,
      p_full_name: params.full_name,
      p_username: params.username,
      p_role_name: params.role_name,
    });
    if (error) throw new Error(error.message);
  },

  async updateUserRole(userId: string, roleName: RoleName): Promise<void> {
    const { data: role } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();

    if (!role) throw new Error("Cargo não encontrado");

    await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role_id: role.id }, { onConflict: "user_id" });
  },

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase.rpc("delete_user_with_profile", {
      p_user_id: userId,
    });
    if (error) throw new Error(error.message);
  },
};

// ============================================================
// MÓDULOS E PERMISSÕES
// ============================================================
export const permissionsService = {
  async getModules(): Promise<Module[]> {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data as Module[]) ?? [];
  },

  async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("created_at");
    if (error) throw new Error(error.message);
    return (data as Role[]) ?? [];
  },

  async getPermissionsByRole(roleId: string): Promise<RolePermission[]> {
    const { data, error } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role_id", roleId);
    if (error) throw new Error(error.message);
    return (data as RolePermission[]) ?? [];
  },

  async getMyPermissions(userId: string): Promise<RolePermission[]> {
    const { data } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", userId)
      .single();

    if (!data) return [];

    const { data: perms } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role_id", (data as any).role_id);

    return (perms as RolePermission[]) ?? [];
  },

  async updatePermission(
    roleId: string,
    moduleId: string,
    permissions: Partial<
      Pick<
        RolePermission,
        "can_view" | "can_create" | "can_update" | "can_delete"
      >
    >,
  ): Promise<void> {
    const { error } = await supabase.from("role_permissions").upsert(
      {
        role_id: roleId,
        module_id: moduleId,
        ...permissions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "role_id,module_id" },
    );
    if (error) throw new Error(error.message);
  },

  async updateAllPermissions(
    roleId: string,
    permissions: {
      moduleId: string;
      can_view: boolean;
      can_create: boolean;
      can_update: boolean;
      can_delete: boolean;
    }[],
  ): Promise<void> {
    const upserts = permissions.map((p) => ({
      role_id: roleId,
      module_id: p.moduleId,
      can_view: p.can_view,
      can_create: p.can_create,
      can_update: p.can_update,
      can_delete: p.can_delete,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("role_permissions")
      .upsert(upserts, { onConflict: "role_id,module_id" });
    if (error) throw new Error(error.message);
  },
};

// ============================================================
// AUDITORIA
// ============================================================
export const auditService = {
  async log(params: {
    userId: string;
    userEmail: string;
    action: AuditAction;
    module: string;
    recordId?: string;
    recordLabel?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
  }): Promise<void> {
    await supabase.from("audit_logs").insert({
      user_id: params.userId,
      user_email: params.userEmail,
      action: params.action,
      module: params.module,
      record_id: params.recordId ?? null,
      record_label: params.recordLabel ?? null,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
    });
  },

  async getAll(filters?: {
    module?: string;
    action?: string;
    userId?: string;
    from?: string;
    to?: string;
  }): Promise<AuditLog[]> {
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (filters?.module) query = query.eq("module", filters.module);
    if (filters?.action) query = query.eq("action", filters.action);
    if (filters?.userId) query = query.eq("user_id", filters.userId);
    if (filters?.from) query = query.gte("created_at", filters.from);
    if (filters?.to) query = query.lte("created_at", filters.to);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data as AuditLog[]) ?? [];
  },
};
