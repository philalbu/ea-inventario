import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { LoginPage } from "@/pages/LoginPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { EventsPage } from "@/pages/EventsPage";
import { EventDetailPage } from "@/pages/EventDetailPage";
import { useAuth } from "@/hooks/useAuth";
import { ResponsiblesPage } from "@/pages/ResponsiblesPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route path="/responsibles" element={<ResponsiblesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
