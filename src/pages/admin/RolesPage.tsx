import { useState, useEffect } from "react";
import { Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useRolePermissions } from "@/hooks/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { permissionsService, profilesService } from "@/services/admin.service";
import { usePermissionStore } from "@/store/permission.store";
import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types";

const roleConfig = {
  super_admin: {
    label: "Super Admin",
    color: "text-red-700 bg-red-50 border-red-200",
    desc: "Acesso total ao sistema",
  },
  admin: {
    label: "Admin",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    desc: "Acesso total exceto cargos",
  },
  operator: {
    label: "Operador",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    desc: "Acesso conforme permissões",
  },
};

export function RolesPage() {
  const { roles, modules, isLoading, updateAllPermissions } =
    useRolePermissions();
  const { user } = useAuthStore();
  const { setPermissions, setRole } = usePermissionStore();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [localPerms, setLocalPerms] = useState<
    Record<
      string,
      {
        can_view: boolean;
        can_create: boolean;
        can_update: boolean;
        can_delete: boolean;
      }
    >
  >({});

  const { data: rolePerms = [] } = useQuery({
    queryKey: ["role-permissions", selectedRole?.id],
    queryFn: () => permissionsService.getPermissionsByRole(selectedRole!.id),
    enabled: !!selectedRole,
  });

  useEffect(() => {
    if (!rolePerms.length) return;
    const map: typeof localPerms = {};
    rolePerms.forEach((p) => {
      map[p.module_id] = {
        can_view: p.can_view,
        can_create: p.can_create,
        can_update: p.can_update,
        can_delete: p.can_delete,
      };
    });
    setLocalPerms(map);
  }, [rolePerms]);

  const togglePerm = (
    moduleId: string,
    key: keyof (typeof localPerms)[string],
  ) => {
    setLocalPerms((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] ?? {
          can_view: false,
          can_create: false,
          can_update: false,
          can_delete: false,
        }),
        [key]: !prev[moduleId]?.[key],
      },
    }));
  };

  const toggleAll = (moduleId: string, value: boolean) => {
    setLocalPerms((prev) => ({
      ...prev,
      [moduleId]: {
        can_view: value,
        can_create: value,
        can_update: value,
        can_delete: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const permissions = modules.map((m) => ({
        moduleId: m.id,
        ...(localPerms[m.id] ?? {
          can_view: false,
          can_create: false,
          can_update: false,
          can_delete: false,
        }),
      }));
      await updateAllPermissions.mutateAsync({
        roleId: selectedRole.id,
        permissions,
      });

      // Recarrega permissões do usuário logado imediatamente
      if (user) {
        const [userRole, userPermissions] = await Promise.all([
          profilesService.getMyRole(user.id),
          permissionsService.getMyPermissions(user.id),
        ]);
        setRole(userRole);
        setPermissions(userPermissions);
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Cargos e Permissões
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Defina o que cada cargo pode acessar no sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de cargos */}
        <div className="space-y-3">
          {roles.map((role) => {
            const config = roleConfig[role.name as keyof typeof roleConfig];
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedRole?.id === role.id ? "border-primary-300 bg-primary-50 shadow-sm" : "border-gray-100 bg-white hover:shadow-sm"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {config?.label}
                      </p>
                      <p className="text-xs text-gray-400">{config?.desc}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${selectedRole?.id === role.id ? "rotate-90 text-primary-600" : "text-gray-400"}`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Permissões */}
        {selectedRole ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {
                    roleConfig[selectedRole.name as keyof typeof roleConfig]
                      ?.label
                  }
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Defina as permissões por módulo
                </p>
              </div>
              <Button size="sm" onClick={handleSave} isLoading={saving}>
                Salvar
              </Button>
            </div>

            <div className="grid grid-cols-6 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-2">Módulo</div>
              <div className="text-center">Ver</div>
              <div className="text-center">Criar</div>
              <div className="text-center">Editar</div>
              <div className="text-center">Deletar</div>
            </div>

            <div className="divide-y divide-gray-50">
              {modules.map((module) => {
                const perm = localPerms[module.id] ?? {
                  can_view: false,
                  can_create: false,
                  can_update: false,
                  can_delete: false,
                };
                const allChecked =
                  perm.can_view &&
                  perm.can_create &&
                  perm.can_update &&
                  perm.can_delete;
                const isSuperAdmin = selectedRole.name === "super_admin";

                return (
                  <div
                    key={module.id}
                    className="grid grid-cols-6 gap-2 px-6 py-4 items-center hover:bg-gray-50/50"
                  >
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        disabled={isSuperAdmin}
                        onChange={(e) => toggleAll(module.id, e.target.checked)}
                        className="w-4 h-4 accent-primary-600 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {module.label}
                      </span>
                    </div>
                    {(
                      [
                        "can_view",
                        "can_create",
                        "can_update",
                        "can_delete",
                      ] as const
                    ).map((key) => (
                      <div key={key} className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={isSuperAdmin ? true : perm[key]}
                          disabled={isSuperAdmin}
                          onChange={() => togglePerm(module.id, key)}
                          className="w-4 h-4 accent-primary-600 cursor-pointer disabled:opacity-60"
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {selectedRole.name === "super_admin" && (
              <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
                <p className="text-xs text-amber-700">
                  ⚠️ Super Admin tem acesso total e não pode ter permissões
                  alteradas.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <Shield className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">Selecione um cargo</p>
            <p className="text-sm text-gray-400 mt-1">
              para ver e editar suas permissões
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
