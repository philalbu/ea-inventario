import { Package, Edit2, Trash2, MapPin } from "lucide-react";
import { StatusBadge, Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { getThumbnailUrl } from "@/utils/image";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  canUpdate = true,
  canDelete = true,
}: ProductCardProps) {
  const quantityColor =
    product.quantity === 0
      ? "text-red-600"
      : product.quantity <= 5
        ? "text-amber-600"
        : "text-gray-900";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group flex flex-col">
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={getThumbnailUrl(product.image_url) ?? ""}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-200" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <StatusBadge status={product.status} />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1 mb-2">
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
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div>
            <p className={`text-[24px] font-bold ${quantityColor}`}>
              {product.quantity}
              <span className="text-xs font-[600] text-gray-700 ml-1">un</span>
            </p>
          </div>
          {(canUpdate || canDelete) && (
            <div className="flex gap-1.5">
              {canUpdate && onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(product)}
                  className="rounded-lg px-2.5 py-1.5"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(product)}
                  className="rounded-lg px-2.5 py-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
