import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Plus, Star, Flame } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const displayPrice = product.promotional && product.promotionalPrice 
    ? product.promotionalPrice 
    : product.price

  return (
    <div className="group relative overflow-hidden rounded-lg border border-dark-border bg-dark-card transition-all hover:border-primary">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-dark-bg">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.promotional && (
            <Badge variant="destructive">Promoção</Badge>
          )}
          {product.featured && (
            <Badge variant="default" className="bg-yellow-500 text-black">
              <Star className="h-3 w-3 mr-1" />
              Destaque
            </Badge>
          )}
          {product.bestseller && (
            <Badge variant="secondary" className="bg-orange-500 text-white">
              <Flame className="h-3 w-3 mr-1" />
              Mais Vendido
            </Badge>
          )}
          {!product.available && (
            <Badge variant="outline" className="bg-black/50 text-white backdrop-blur-sm">
              Indisponível
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-anton text-lg text-dark-text line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-sm text-dark-muted line-clamp-2">{product.description}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            {product.promotional && product.promotionalPrice && (
              <span className="text-sm text-dark-muted line-through">
                {formatCurrency(product.price)}
              </span>
            )}
            <span className="font-manrope text-xl font-bold text-primary">
              {formatCurrency(displayPrice)}
            </span>
          </div>
          
          {product.available && (
            <button
              onClick={() => onAddToCart(product)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!product.available}
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
