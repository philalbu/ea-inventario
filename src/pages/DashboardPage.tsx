import {
  Package,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  productsService,
  categoriesService,
} from "@/services/products.service";
import { useAuthStore } from "@/store/auth.store";
import { StatusBadge } from "@/components/common/Badge";
import { Spinner } from "@/components/common/Spinner";
import { getThumbnailUrl } from "@/utils/image";

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["products-stats"],
    queryFn: () => productsService.getStats(),
    enabled: !!user,
  });

  const { data: criticalProducts = [], isLoading: isLoadingCritical } =
    useQuery({
      queryKey: ["products-critical"],
      queryFn: async () => {
        const { data } = await productsService.getAll(0, 100);
        return data
          .filter((p) => p.quantity <= 5)
          .sort((a, b) => a.quantity - b.quantity)
          .slice(0, 5);
      },
      enabled: !!user,
    });

  const { data: recentProducts = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["products-recent"],
    queryFn: async () => {
      const { data } = await productsService.getAll(0, 5);
      return data;
    },
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getAll(),
    enabled: !!user,
  });

  const { data: categoryStats = [] } = useQuery({
    queryKey: ["categories-stats"],
    queryFn: async () => {
      const { data: products } = await productsService.getAll(0, 9999);
      const cats = await categoriesService.getAll();
      return cats.map((cat) => ({
        ...cat,
        count: products.filter((p) => p.category_id === cat.id).length,
      }));
    },
    enabled: !!user,
  });

  const isLoading = isLoadingStats || isLoadingCritical || isLoadingRecent;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Visão geral do seu inventário
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total de Produtos",
                value: stats?.total ?? 0,
                icon: Package,
                bg: "bg-primary-50",
                text: "text-primary-700",
                iconBg: "bg-primary-100",
              },
              {
                label: "Produtos Ativos",
                value: stats?.active ?? 0,
                icon: CheckCircle,
                bg: "bg-green-50",
                text: "text-green-700",
                iconBg: "bg-green-100",
              },
              {
                label: "Estoque Baixo",
                value: stats?.lowStock ?? 0,
                icon: TrendingDown,
                bg: "bg-amber-50",
                text: "text-amber-700",
                iconBg: "bg-amber-100",
              },
              {
                label: "Sem Estoque",
                value: stats?.outOfStock ?? 0,
                icon: AlertCircle,
                bg: "bg-red-50",
                text: "text-red-700",
                iconBg: "bg-red-100",
              },
            ].map(({ label, value, icon: Icon, bg, text, iconBg }) => (
              <div
                key={label}
                className={`${bg} rounded-2xl p-5 border border-white`}
              >
                <div
                  className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon className={`h-5 w-5 ${text}`} />
                </div>
                <p className={`text-3xl font-bold ${text}`}>{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <h2 className="font-semibold text-gray-900 text-sm">
                    Atenção: Estoque Crítico
                  </h2>
                </div>
                <Link
                  to="/products"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {criticalProducts.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <CheckCircle className="h-8 w-8 text-green-300 mb-2" />
                    <p className="text-sm text-gray-500">Estoque saudável!</p>
                  </div>
                ) : (
                  criticalProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {p.image_url ? (
                            <img
                              src={getThumbnailUrl(p.image_url) ?? ""}
                              alt={p.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-bold ${p.quantity === 0 ? "text-red-600" : "text-amber-600"}`}
                        >
                          {p.quantity} un
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary-500" />
                  <h2 className="font-semibold text-gray-900 text-sm">
                    Adicionados Recentemente
                  </h2>
                </div>
                <Link
                  to="/products"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  Ver todos <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentProducts.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center">
                    <Package className="h-8 w-8 text-gray-200 mb-2" />
                    <p className="text-sm text-gray-500">
                      Nenhum produto ainda
                    </p>
                  </div>
                ) : (
                  recentProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {p.image_url ? (
                            <img
                              src={getThumbnailUrl(p.image_url) ?? ""}
                              alt={p.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {p.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.category_name ?? "Sem categoria"}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {p.quantity} un
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Categories Summary */}
          {categoryStats.length > 0 && (
            <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 text-sm mb-4">
                Distribuição por Categoria
              </h2>
              <div className="flex flex-wrap gap-3">
                {categoryStats.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {cat.name}
                    </span>
                    <span className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 font-semibold">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
