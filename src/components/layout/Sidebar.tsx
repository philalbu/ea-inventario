import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  LogOut,
  ChevronRight,
  Calendar,
  Users,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";
import { usePermissions } from "@/hooks/usePermissions";
import { profilesService } from "@/services/admin.service";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { user } = useAuthStore();
  const { isAdmin, canAccess } = usePermissions();

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: () => profilesService.getMyProfile(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", module: "dashboard" },
    { to: "/products", icon: Package, label: "Produtos", module: "products" },
    { to: "/events", icon: Calendar, label: "Eventos", module: "events" },
    {
      to: "/responsibles",
      icon: Users,
      label: "Responsáveis",
      module: "responsibles",
    },
    { to: "/admin", icon: Shield, label: "Administrador", module: "admin" },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.module === "admin") return isAdmin;
    return canAccess(item.module);
  });

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-primary-700 transition-all duration-300 ease-in-out relative shrink-0",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center px-4 py-5 border-b border-primary-700 bg-white">
        <img
          src="/ea-logo.png"
          alt="Esconderijo do Altíssimo"
          className={cn(
            "object-contain transition-all duration-300",
            collapsed ? "w-10 h-10" : "w-36 h-14",
          )}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-primary-100 hover:bg-primary-700 hover:text-white",
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div
        className={cn(
          "px-2 py-4 border-t border-primary-700",
          collapsed && "flex flex-col items-center",
        )}
      >
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-primary-300">Logado como</p>
            <p className="text-sm font-medium text-white truncate">
              {profile?.username ?? user?.email}
            </p>
          </div>
        )}
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-primary-100 hover:bg-primary-700 hover:text-white transition-colors",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && "Sair"}
        </button>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 text-gray-600 transition-transform",
            collapsed ? "" : "rotate-180",
          )}
        />
      </button>
    </aside>
  );
}
