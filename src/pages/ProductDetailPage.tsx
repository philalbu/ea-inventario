import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Package,
  MapPin,
  AlertTriangle,
  Printer,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { ProductForm } from "@/components/products/ProductForm";
import { Spinner } from "@/components/common/Spinner";
import { StatusBadge, Badge } from "@/components/common/Badge";
import { useProducts } from "@/hooks/useProducts";
import { productsService } from "@/services/products.service";
import { useAuthStore } from "@/store/auth.store";
import { usePermissionStore } from "@/store/permission.store";
import type { ProductFormData } from "@/types";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const canUpdate = hasPermission("products", "update");
  const canDelete = hasPermission("products", "delete");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const barcodeRef = useRef<SVGSVGElement>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productsService.getById(id!),
    enabled: !!id && !!user,
  });

  const { categories, locations, updateProduct, deleteProduct } = useProducts();

  useEffect(() => {
    if (product?.barcode && barcodeRef.current) {
      JsBarcode(barcodeRef.current, product.barcode, {
        format: "EAN13",
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 12,
        margin: 8,
      });
    }
  }, [product?.barcode]);

  const handleEdit = async (data: ProductFormData) => {
    if (!product) return;
    const cat = categories.find((c) => c.id === data.category_id);
    const loc = locations.find((l) => l.id === data.location_id);
    await updateProduct.mutateAsync({
      id: product.id,
      data: {
        ...data,
        category_name: cat?.name,
        location_id: loc?.id || null,
        location_name: loc?.name || null,
      } as Partial<ProductFormData>,
      currentImagePath: product.image_path,
    });
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!product) return;
    await deleteProduct.mutateAsync({
      id: product.id,
      imagePath: product.image_path,
      name: product.name,
    });
    navigate("/products");
  };

  const handlePrint = () => {
    if (!product?.barcode) return;
    const win = window.open("", "_blank", "width=400,height=300");
    if (!win) return;
    const svg = barcodeRef.current?.outerHTML ?? "";
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta - ${product.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; padding: 16px; }
            .name { font-size: 14px; font-weight: 600; text-align: center; margin-bottom: 8px; max-width: 200px; }
            svg { max-width: 200px; }
          </style>
        </head>
        <body>
          <p class="name">${product.name}</p>
          ${svg}
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const quantityColor =
    product?.quantity === 0
      ? "text-red-600"
      : (product?.quantity ?? 0) <= 5
        ? "text-amber-600"
        : "text-gray-900";

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-20">
        <p className="text-gray-500">Produto não encontrado.</p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate("/products")}
        >
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex gap-2">
          {canUpdate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Remover
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Imagem */}
        <div className="relative h-64 bg-gray-50">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-200" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <StatusBadge status={product.status} />
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {product.category_name && (
              <Badge color="blue">{product.category_name}</Badge>
            )}
            {product.location_name && (
              <Badge color="purple">
                <MapPin className="h-3 w-3 mr-1 inline" />
                {product.location_name}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Quantidade</p>
              <p className={`text-3xl font-bold ${quantityColor}`}>
                {product.quantity}
                <span className="text-sm font-medium text-gray-500 ml-1">
                  un
                </span>
              </p>
            </div>
          </div>

          {product.description && (
            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-1">Descrição</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Código de Barras */}
          {product.barcode && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400">Código de Barras</p>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir etiqueta
                </button>
              </div>
              <div className="flex justify-center bg-gray-50 rounded-xl p-4">
                <svg ref={barcodeRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Editar */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar Produto"
        size="md"
      >
        <ProductForm
          onSubmit={handleEdit}
          onCancel={() => setIsEditOpen(false)}
          categories={categories}
          locations={locations}
          initialData={product}
          isSubmitting={updateProduct.isPending}
        />
      </Modal>

      {/* Modal Deletar */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Remover Produto"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Remover "{product.name}"?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteOpen(false)}
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
    </div>
  );
}
