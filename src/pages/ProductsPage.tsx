import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductTable } from "@/components/products/ProductTable";
import { ProductForm } from "@/components/products/ProductForm";
import { Spinner } from "@/components/common/Spinner";
import { useProducts } from "@/hooks/useProducts";
import type { Product, ViewMode, ProductFormData } from "@/types";

export function ProductsPage() {
  const {
    products,
    categories,
    locations,
    isLoadingProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    deleteCategory,
    createLocation,
    deleteLocation,
  } = useProducts();

  const [view, setView] = useState<ViewMode>("card");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchSearch =
          !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = !filterCategory || p.category_id === filterCategory;
        const matchStatus = !filterStatus || p.status === filterStatus;
        return matchSearch && matchCat && matchStatus;
      }),
    [products, search, filterCategory, filterStatus],
  );

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.status === "active").length,
      lowStock: products.filter((p) => p.quantity <= 5 && p.quantity > 0)
        .length,
      outOfStock: products.filter((p) => p.quantity === 0).length,
    }),
    [products],
  );

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} produto{products.length !== 1 ? "s" : ""}{" "}
            cadastrado{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCatOpen(true)}
          >
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Categorias</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLocOpen(true)}
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Locais</span>
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Produto</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total",
            value: stats.total,
            color: "bg-gray-50 text-gray-700",
            border: "border-gray-100",
          },
          {
            label: "Ativos",
            value: stats.active,
            color: "bg-green-50 text-green-700",
            border: "border-green-100",
          },
          {
            label: "Estoque Baixo",
            value: stats.lowStock,
            color: "bg-amber-50 text-amber-700",
            border: "border-amber-100",
          },
          {
            label: "Sem Estoque",
            value: stats.outOfStock,
            color: "bg-red-50 text-red-700",
            border: "border-red-100",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border ${stat.border} ${stat.color} px-4 py-3`}
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="low_stock">Estoque Baixo</option>
            <option value="inactive">Inativo</option>
          </select>
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

      {isLoadingProducts ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : view === "card" ? (
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
      ) : (
        <ProductTable
          products={filtered}
          onEdit={setEditingProduct}
          onDelete={setDeletingProduct}
        />
      )}

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
              placeholder="Nome do local (ex: Prateleira A, Depósito 1...)"
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
