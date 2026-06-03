import { Package, Edit2, Trash2 } from 'lucide-react'
import { StatusBadge, Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const quantityColor =
    product.quantity === 0
      ? 'text-red-600'
      : product.quantity <= 5
      ? 'text-amber-600'
      : 'text-gray-900'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="relative h-44 bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
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

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
            {product.name}
          </h3>
          {product.category_name && (
            <Badge color="blue" className="mb-2">
              {product.category_name}
            </Badge>
          )}
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Quantidade</p>
            <p className={`text-xl font-bold ${quantityColor}`}>
              {product.quantity}
              <span className="text-xs font-normal text-gray-400 ml-1">un</span>
            </p>
          </div>
          <div className="flex gap-1.5">
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
        </div>
      </div>
    </div>
  )
}
