import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import {
  profilesService,
  permissionsService,
  auditService,
} from "@/services/admin.service";
import type { RoleName, AuditAction } from "@/types";

// ============================================================
// HOOK: Usuários e Perfis
// ============================================================
export function useUsers() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => profilesService.getAll(),
    enabled: !!user,
  });

  const createUser = useMutation({
    mutationFn: (params: {
      full_name: string;
      username: string;
      email: string;
      password: string;
      role_name: RoleName;
    }) => profilesService.createUser(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const updateUserRole = useMutation({
    mutationFn: ({
      userId,
      roleName,
    }: {
      userId: string;
      roleName: RoleName;
    }) => profilesService.updateUserRole(userId, roleName),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) => profilesService.deleteUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  return {
    users: users.data ?? [],
    isLoading: users.isLoading,
    createUser,
    updateUserRole,
    deleteUser,
  };
}

// ============================================================
// HOOK: Permissões do usuário logado
// ============================================================
export function useMyPermissions() {
  const { user } = useAuthStore();

  const permissionsQuery = useQuery({
    queryKey: ["my-permissions", user?.id],
    queryFn: () => permissionsService.getMyPermissions(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const roleQuery = useQuery({
    queryKey: ["my-role", user?.id],
    queryFn: () => profilesService.getMyRole(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const hasPermission = (
    module: string,
    action: "view" | "create" | "update" | "delete",
  ) => {
    // Super admin tem tudo
    if (roleQuery.data === "super_admin") return true;

    const perm = permissionsQuery.data?.find((p) => {
      // Precisa buscar pelo nome do módulo — via module_id
      return true; // simplificado, será refinado depois
    });

    if (!perm) return false;

    const map = {
      view: perm.can_view,
      create: perm.can_create,
      update: perm.can_update,
      delete: perm.can_delete,
    };
    return map[action];
  };

  const canAccess = (module: string) => {
    if (roleQuery.data === "super_admin") return true;
    if (roleQuery.data === "admin") return module !== "admin" ? true : false;
    return permissionsQuery.data?.some((p) => p.can_view) ?? false;
  };

  return {
    permissions: permissionsQuery.data ?? [],
    role: roleQuery.data,
    isLoading: permissionsQuery.isLoading || roleQuery.isLoading,
    isSuperAdmin: roleQuery.data === "super_admin",
    isAdmin: roleQuery.data === "admin" || roleQuery.data === "super_admin",
    isOperator: roleQuery.data === "operator",
    hasPermission,
    canAccess,
  };
}

// ============================================================
// HOOK: Gerenciar permissões por cargo
// ============================================================
export function useRolePermissions() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const roles = useQuery({
    queryKey: ["roles"],
    queryFn: () => permissionsService.getRoles(),
    enabled: !!user,
  });

  const modules = useQuery({
    queryKey: ["modules"],
    queryFn: () => permissionsService.getModules(),
    enabled: !!user,
  });

  const getPermissionsByRole = (roleId: string) =>
    useQuery({
      queryKey: ["role-permissions", roleId],
      queryFn: () => permissionsService.getPermissionsByRole(roleId),
      enabled: !!roleId,
    });

  const updateAllPermissions = useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: {
        moduleId: string;
        can_view: boolean;
        can_create: boolean;
        can_update: boolean;
        can_delete: boolean;
      }[];
    }) => permissionsService.updateAllPermissions(roleId, permissions),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["role-permissions", vars.roleId] });
      qc.invalidateQueries({ queryKey: ["my-permissions"] });
    },
  });

  return {
    roles: roles.data ?? [],
    modules: modules.data ?? [],
    isLoading: roles.isLoading || modules.isLoading,
    getPermissionsByRole,
    updateAllPermissions,
  };
}

// ============================================================
// HOOK: Auditoria
// ============================================================
export function useAudit() {
  const { user } = useAuthStore();

  const logs = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => auditService.getAll(),
    enabled: !!user,
  });

  const log = async (params: {
    action: AuditAction;
    module: string;
    recordId?: string;
    recordLabel?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
  }) => {
    if (!user) return;
    await auditService.log({
      userId: user.id,
      userEmail: user.email ?? "",
      ...params,
    });
  };

  return {
    logs: logs.data ?? [],
    isLoading: logs.isLoading,
    refetch: logs.refetch,
    log,
  };
}
