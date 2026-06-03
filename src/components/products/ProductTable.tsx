import { Package, Edit2, Trash2, ArrowUpDown, MapPin } from "lucide-react";
import { useState } from "react";
import { StatusBadge, Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import type { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

type SortKey = "name" | "quantity" | "category_name" | "status" | "created_at";

export function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "created_at",
    dir: "desc",
  });

  const sorted = [...products].sort((a, b) => {
    const cmp = String(a[sort.key] ?? "").localeCompare(
      String(b[sort.key] ?? ""),
      "pt-BR",
      { numeric: true },
    );
    return sort.dir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  const SortBtn = ({ col }: { col: SortKey }) => (
    <button
      onClick={() => toggleSort(col)}
      className="inline-flex items-center gap-1 hover:text-gray-700"
    >
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="flex items-center gap-1">
                Produto <SortBtn col="name" />
              </div>
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="flex items-center gap-1">
                Categoria <SortBtn col="category_name" />
              </div>
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Local
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="flex items-center gap-1">
                Qtd <SortBtn col="quantity" />
              </div>
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="flex items-center gap-1">
                Status <SortBtn col="status" />
              </div>
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {product.name}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                {product.category_name ? (
                  <Badge color="blue">{product.category_name}</Badge>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {product.location_name ? (
                  <Badge color="purple">
                    <MapPin className="h-3 w-3 mr-1 inline" />
                    {product.location_name}
                  </Badge>
                ) : (
                  <span className="text-xs text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-sm font-semibold ${product.quantity === 0 ? "text-red-600" : product.quantity <= 5 ? "text-amber-600" : "text-gray-900"}`}
                >
                  {product.quantity}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={product.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="rounded-lg px-2.5 py-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(product)}
                    className="rounded-lg px-2.5 py-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
