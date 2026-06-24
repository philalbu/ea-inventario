import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { FullPageSpinner } from "@/components/common/Spinner";

export function ProtectedLayout() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto md:pt-0 pt-16 pb-24 md:pb-0">
        <MobileHeader />
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
}
