import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  Plus,
  Tag,
  MapPin,
  X,
  ScanLine,
} from "lucide-react";
import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/utils/cn";

export function MobileBottomNav() {
  const { canAccess } = usePermissions();
  const [fabOpen, setFabOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Início", module: "dashboard" },
    { to: "/products", icon: Package, label: "Produtos", module: "products" },
    { to: "/events", icon: Calendar, label: "Eventos", module: "events" },
    {
      to: "/responsibles",
      icon: Users,
      label: "Responsáveis",
      module: "responsibles",
    },
  ];

  const visibleItems = navItems.filter((item) => canAccess(item.module));
  const half = Math.floor(visibleItems.length / 2);
  const leftItems = visibleItems.slice(0, half);
  const rightItems = visibleItems.slice(half);

  const fabActions = [
    {
      label: "Escanear",
      icon: ScanLine,
      action: () => {
        navigate("/scan");
        setFabOpen(false);
      },
    },
    {
      label: "Produto",
      icon: Package,
      action: () => {
        navigate("/products?new=1");
        setFabOpen(false);
      },
    },
    {
      label: "Categoria",
      icon: Tag,
      action: () => {
        navigate("/products?cat=1");
        setFabOpen(false);
      },
    },
    {
      label: "Local",
      icon: MapPin,
      action: () => {
        navigate("/products?loc=1");
        setFabOpen(false);
      },
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity duration-200",
          fabOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setFabOpen(false)}
      />

      {/* FAB actions */}
      {fabOpen && (
        <div className="md:hidden fixed bottom-[109px] left-[180px] -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          {fabActions.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-lg border border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <item.icon className="h-4 w-4 text-primary-600" />
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-4 mb-4 bg-white rounded-2xl px-2 py-2 flex items-center justify-around shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100">
          {leftItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                  isActive
                    ? "text-primary-600"
                    : "text-gray-400 hover:text-gray-600",
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}

          <button
            onClick={() => setFabOpen(!fabOpen)}
            className={cn(
              "relative -top-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
              fabOpen
                ? "bg-gray-700 rotate-45"
                : "bg-primary-600 hover:bg-primary-700",
            )}
          >
            {fabOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Plus className="h-6 w-6 text-white" />
            )}
          </button>

          {rightItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                  isActive
                    ? "text-primary-600"
                    : "text-gray-400 hover:text-gray-600",
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
