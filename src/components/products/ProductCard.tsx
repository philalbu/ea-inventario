import { Package, MapPin, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge, Badge } from "@/components/common/Badge";
import { getThumbnailUrl } from "@/utils/image";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  canUpdate?: boolean;
}

export function ProductCard({
  product,
  onEdit,
  canUpdate = true,
}: ProductCardProps) {
  const navigate = useNavigate();
  const quantityColor =
    product.quantity === 0
      ? "text-red-600"
      : product.quantity <= 5
        ? "text-amber-600"
        : "text-gray-900";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group flex flex-col relative">
      {/* Botão de edição */}
      {canUpdate && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
        >
          <Edit2 className="h-3 w-3 text-gray-600" />
        </button>
      )}

      {/* Imagem — clicável */}
      <div
        onClick={() => navigate(`/products/${product.id}`)}
        className="relative h-44 bg-gray-50 overflow-hidden cursor-pointer"
      >
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

      {/* Conteúdo — clicável */}
      <div
        onClick={() => navigate(`/products/${product.id}`)}
        className="p-4 flex flex-col flex-1 cursor-pointer"
      >
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2">
          {product.name}
        </h3>
        <div className="flex flex-wrap gap-1 mb-3">
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
        <div className="mt-auto pt-3 border-t border-gray-50">
          <p className={`text-[24px] font-bold ${quantityColor}`}>
            {product.quantity}
            <span className="text-xs font-[600] text-gray-700 ml-1">un</span>
          </p>
        </div>
      </div>
    </div>
  );
}
