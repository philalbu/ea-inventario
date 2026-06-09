import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/store/auth.store";
import { FullPageSpinner } from "@/components/common/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: string;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  module,
  requireAdmin = false,
  requireSuperAdmin = false,
}: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const { role, isLoading, isSuperAdmin, isAdmin, canAccess } =
    usePermissions();

  if (isLoading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  // Requer super admin
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  // Requer admin ou superior
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Verifica acesso ao módulo
  if (module && !canAccess(module)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
