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

    const load = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const [userRole, userPermissions, modules] = await Promise.all([
          profilesService.getMyRole(user.id),
          permissionsService.getMyPermissions(user.id),
          permissionsService.getModules(),
        ]);

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
        if (showLoading) setLoading(false);
      }
    };

    load(true);

    const interval = setInterval(() => load(false), 30000);
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
