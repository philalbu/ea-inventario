import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Calendar,
  Users,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Produtos" },
  { to: "/events", icon: Calendar, label: "Eventos" },
  { to: "/responsibles", icon: Users, label: "Responáveis" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-primary-700",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
          <Package className="h-5 w-5 text-primary-600" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-white font-bold text-lg leading-none">
              Inventário
            </span>
            <span className="block text-primary-200 text-xs">Pro</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
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
          collapsed && "flex justify-center",
        )}
      >
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-primary-300">Logado como</p>
            <p className="text-sm font-medium text-white truncate">
              ederson.albuquerque
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-primary-700 transition-all duration-300 ease-in-out relative shrink-0",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarContent />
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

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-primary-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Package className="h-4 w-4 text-primary-600" />
          </div>
          <span className="text-white font-bold">Inventário Pro</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-1"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 bg-primary-700 h-full pt-16">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
