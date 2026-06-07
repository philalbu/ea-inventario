import { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  AlertTriangle,
  Tag,
  Trash2,
  MapPin,
  ChevronDown,
  Package,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductForm } from "@/components/products/ProductForm";
import { Spinner } from "@/components/common/Spinner";
import { useProducts } from "@/hooks/useProducts";
import { productsService } from "@/services/products.service";
import { useAuthStore } from "@/store/auth.store";
import type { Product, ViewMode, ProductFormData } from "@/types";

export function ProductsPage() {
  const { user } = useAuthStore();
  const {
    products,
    categories,
    locations,
    isLoadingProducts,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    deleteCategory,
    createLocation,
    deleteLocation,
  } = useProducts();

  const { data: stats } = useQuery({
    queryKey: ["products-stats"],
    queryFn: () => productsService.getStats(),
    enabled: !!user,
  });

  const [view, setView] = useState<ViewMode>("card");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [catFilterOpen, setCatFilterOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catError, setCatError] = useState("");
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocDesc, setNewLocDesc] = useState("");
  const [locError, setLocError] = useState("");

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCategory || p.category_id === filterCategory;
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, filterCategory, filterStatus]);

  const handleAdd = async (data: ProductFormData) => {
    const cat = categories.find((c) => c.id === data.category_id);
    const loc = locations.find((l) => l.id === data.location_id);
    await createProduct.mutateAsync({
      ...data,
      category_name: cat?.name,
      location_id: loc?.id || null,
      location_name: loc?.name || null,
    } as ProductFormData);
    setIsAddOpen(false);
  };

  const handleEdit = async (data: ProductFormData) => {
    if (!editingProduct) return;
    const cat = categories.find((c) => c.id === data.category_id);
    const loc = locations.find((l) => l.id === data.location_id);
    await updateProduct.mutateAsync({
      id: editingProduct.id,
      data: {
        ...data,
        category_name: cat?.name,
        location_id: loc?.id || null,
        location_name: loc?.name || null,
      } as Partial<ProductFormData>,
      currentImagePath: editingProduct.image_path,
    });
    setEditingProduct(null);
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    await deleteProduct.mutateAsync({
      id: deletingProduct.id,
      imagePath: deletingProduct.image_path,
    });
    setDeletingProduct(null);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      setCatError("Nome é obrigatório");
      return;
    }
    try {
      await createCategory.mutateAsync(newCatName.trim());
      setNewCatName("");
      setCatError("");
    } catch {
      setCatError("Categoria já existe ou erro ao criar");
    }
  };

  const handleAddLocation = async () => {
    if (!newLocName.trim()) {
      setLocError("Nome é obrigatório");
      return;
    }
    try {
      await createLocation.mutateAsync({
        name: newLocName.trim(),
        description: newLocDesc.trim(),
      });
      setNewLocName("");
      setNewLocDesc("");
      setLocError("");
    } catch {
      setLocError("Local já existe ou erro ao criar");
    }
  };

  const total = stats?.total ?? 0;

  const statusLabel: Record<string, string> = {
    active: "Ativo",
    low_stock: "Estoque Baixo",
    inactive: "Inativo",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-[24px]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} produto{total !== 1 ? "s" : ""} cadastrado
            {total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Dropdown Adicionar */}
        <div className="relative">
          <Button size="sm" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <Plus className="h-4 w-4" />
            <span>Adicionar</span>
          </Button>
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div
                className="absolute right-0 z-20 bg-white rounded-xl shadow-lg border border-gray-300 w-48 overflow-hidden"
                style={{ top: "calc(100% + 12px)" }}
              >
                <button
                  onClick={() => {
                    setIsAddOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-primary-600 hover:text-white transition-colors"
                >
                  <Package className="h-4 w-4" /> Produto
                </button>
                <button
                  onClick={() => {
                    setIsCatOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Tag className="h-4 w-4" /> Categoria
                </button>
                <button
                  onClick={() => {
                    setIsLocOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <MapPin className="h-4 w-4" /> Local
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-[32px]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {/* Dropdown Categoria */}
          <div className="relative">
            <button
              onClick={() => {
                setCatFilterOpen(!catFilterOpen);
                setStatusFilterOpen(false);
              }}
              className="flex items-center gap-2 text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">
                {filterCategory
                  ? categories.find((c) => c.id === filterCategory)?.name
                  : "Categoria"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${catFilterOpen ? "rotate-180" : ""}`}
              />
            </button>
            {catFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setCatFilterOpen(false)}
                />
                <div
                  className="absolute left-0 z-20 bg-white rounded-xl shadow-lg border border-gray-300 w-48 overflow-hidden"
                  style={{ top: "calc(100% + 12px)" }}
                >
                  <button
                    onClick={() => {
                      setFilterCategory("");
                      setCatFilterOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 text-sm transition-colors ${!filterCategory ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    Todas as categorias
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setFilterCategory(c.id);
                        setCatFilterOpen(false);
                      }}
                      className={`flex items-center w-full px-4 py-3 text-sm transition-colors ${filterCategory === c.id ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700 hover:bg-gray-200"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Dropdown Status */}
          <div className="relative">
            <button
              onClick={() => {
                setStatusFilterOpen(!statusFilterOpen);
                setCatFilterOpen(false);
              }}
              className="flex items-center gap-2 text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">
                {filterStatus ? statusLabel[filterStatus] : "Status"}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${statusFilterOpen ? "rotate-180" : ""}`}
              />
            </button>
            {statusFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setStatusFilterOpen(false)}
                />
                <div
                  className="absolute left-0 z-20 bg-white rounded-xl shadow-lg border border-gray-300 w-44 overflow-hidden"
                  style={{ top: "calc(100% + 12px)" }}
                >
                  {[
                    { value: "", label: "Todos os status" },
                    { value: "active", label: "Ativo" },
                    { value: "low_stock", label: "Estoque Baixo" },
                    { value: "inactive", label: "Inativo" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilterStatus(opt.value);
                        setStatusFilterOpen(false);
                      }}
                      className={`flex items-center w-full px-4 py-3 text-sm transition-colors ${filterStatus === opt.value ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-700 hover:bg-gray-200"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setView("card")}
              className={`p-1.5 rounded-md transition-colors ${view === "card" ? "bg-white shadow-sm text-primary-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-primary-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      {isLoadingProducts ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : view === "card" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={setEditingProduct}
                onDelete={setDeletingProduct}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-20 text-center">
                <Filter className="h-10 w-10 text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium">
                  Nenhum produto encontrado
                </p>
              </div>
            )}
          </div>
          <div ref={sentinelRef} className="flex justify-center py-6">
            {isFetchingNextPage && <Spinner size="md" />}
            {!hasNextPage &&
              products.length > 0 &&
              !search &&
              !filterCategory &&
              !filterStatus && (
                <p className="text-sm text-gray-400">
                  Todos os produtos carregados
                </p>
              )}
          </div>
        </>
      ) : (
        <>
          <ProductTable
            products={filtered}
            onEdit={setEditingProduct}
            onDelete={setDeletingProduct}
          />
          <div ref={sentinelRef} className="flex justify-center py-6">
            {isFetchingNextPage && <Spinner size="md" />}
            {!hasNextPage && products.length > 0 && (
              <p className="text-sm text-gray-400">
                Todos os produtos carregados
              </p>
            )}
          </div>
        </>
      )}

      {/* Modal: Adicionar */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Novo Produto"
        size="md"
      >
        <ProductForm
          onSubmit={handleAdd}
          onCancel={() => setIsAddOpen(false)}
          categories={categories}
          locations={locations}
          isSubmitting={createProduct.isPending}
        />
      </Modal>

      {/* Modal: Editar */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Editar Produto"
        size="md"
      >
        {editingProduct && (
          <ProductForm
            onSubmit={handleEdit}
            onCancel={() => setEditingProduct(null)}
            categories={categories}
            locations={locations}
            initialData={editingProduct}
            isSubmitting={updateProduct.isPending}
          />
        )}
      </Modal>

      {/* Modal: Deletar */}
      <Modal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Remover Produto"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Remover "{deletingProduct?.name}"?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setDeletingProduct(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              isLoading={deleteProduct.isPending}
              onClick={handleDelete}
            >
              Remover
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Locais */}
      <Modal
        isOpen={isLocOpen}
        onClose={() => setIsLocOpen(false)}
        title="Gerenciar Locais"
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nome do local..."
              value={newLocName}
              onChange={(e) => {
                setNewLocName(e.target.value);
                setLocError("");
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Descrição (opcional)"
                value={newLocDesc}
                onChange={(e) => setNewLocDesc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddLocation()}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                size="sm"
                onClick={handleAddLocation}
                isLoading={createLocation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {locError && <p className="text-xs text-red-600">{locError}</p>}
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    {loc.name}
                  </p>
                  {loc.description && (
                    <p className="text-xs text-gray-400">{loc.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteLocation.mutate(loc.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {locations.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhum local cadastrado
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal: Categorias */}
      <Modal
        isOpen={isCatOpen}
        onClose={() => setIsCatOpen(false)}
        title="Gerenciar Categorias"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nova categoria..."
              value={newCatName}
              onChange={(e) => {
                setNewCatName(e.target.value);
                setCatError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button
              size="sm"
              onClick={handleAddCategory}
              isLoading={createCategory.isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {catError && <p className="text-xs text-red-600">{catError}</p>}
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{cat.name}</span>
                <button
                  onClick={() => deleteCategory.mutate(cat.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhuma categoria
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
