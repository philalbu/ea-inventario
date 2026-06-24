import { useQuery } from "@tanstack/react-query";
import { ChevronDown, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { profilesService } from "@/services/admin.service";

export function MobileHeader() {
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => profilesService.getMyProfile(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const firstName = profile?.username?.split(".")?.[0] ?? user?.email ?? "";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-5 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
      >
        <div className="text-left">
          <p className="text-lg font-bold text-gray-900 leading-tight">
            Olá, {displayName}
          </p>
          <p className="text-xs text-gray-400">Bem-vindo ao Inventário</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-4 right-4 top-full mt-2 z-50 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {isAdmin && (
              <button
                onClick={() => {
                  navigate("/admin");
                  setOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <Shield className="h-4 w-4 text-primary-600" />
                Administrador
              </button>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sair do sistema
            </button>
          </div>
        </>
      )}
    </div>
  );
}
