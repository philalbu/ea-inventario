import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { usePermissionStore } from "@/store/permission.store";
import { profilesService, permissionsService } from "@/services/admin.service";

export function usePermissions() {
  const { user } = useAuthStore();
  const {
    role,
    permissions,
    isLoading,
    setRole,
    setPermissions,
    setLoading,
    isSuperAdmin,
    isAdmin,
    canAccess,
  } = usePermissionStore();

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const [userRole, userPermissions, modules] = await Promise.all([
          profilesService.getMyRole(user.id),
          permissionsService.getMyPermissions(user.id),
          permissionsService.getModules(),
        ]);

        // Enriquece as permissões com o nome do módulo
        const enriched = userPermissions.map((p) => ({
          ...p,
          module_name: modules.find((m) => m.id === p.module_id)?.name ?? "",
        }));

        setRole(userRole);
        setPermissions(enriched);
      } catch {
        setRole(null);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    load();

    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return {
    role,
    permissions,
    isLoading,
    isSuperAdmin: isSuperAdmin(),
    isAdmin: isAdmin(),
    canAccess,
    hasPermission: usePermissionStore.getState().hasPermission,
  };
}
