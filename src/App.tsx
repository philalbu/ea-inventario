import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { EventsPage } from "@/pages/EventsPage";
import { EventDetailPage } from "@/pages/EventDetailPage";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiblesPage } from "@/pages/ResponsiblesPage";
import { CreateEventPage } from "@/pages/CreateEventPage";
import { AdminPage } from "@/pages/admin/AdminPage";
import { UsersPage } from "@/pages/admin/UsersPage";
import { RolesPage } from "@/pages/admin/RolesPage";
import { AuditPage } from "@/pages/admin/AuditPage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { ScanPage } from "@/pages/ScanPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuth();
  usePermissions();
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/events/new" element={<CreateEventPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route
                path="/products"
                element={
                  <ProtectedRoute module="products">
                    <ProductsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <ProtectedRoute module="products">
                    <ProductDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute module="events">
                    <EventsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/new"
                element={
                  <ProtectedRoute module="events">
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id"
                element={
                  <ProtectedRoute module="events">
                    <EventDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/responsibles"
                element={
                  <ProtectedRoute module="responsibles">
                    <ResponsiblesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <ProtectedRoute requireAdmin>
                    <RolesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedRoute requireAdmin>
                    <AuditPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
