'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Plus, Star, Flame, Check } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false)

  const displayPrice = product.promotional && product.promotionalPrice 
    ? product.promotionalPrice 
    : product.price

  const handleAdd = () => {
    if (!product.available) return
    onAddToCart(product)
    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
    }, 900)
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-dark-border bg-dark-card transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(132,204,22,0.12)] flex flex-col justify-between">
      {/* Image */}
      <div>
        <div className="relative aspect-square overflow-hidden bg-dark-bg">
          <img
            src={product.image || '/logo.png'}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = '/logo.png'
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          
          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.promotional && (
              <Badge variant="destructive">Promoção</Badge>
            )}
            {product.featured && (
              <Badge variant="default">
                <Star className="h-3 w-3 mr-1 fill-black" />
                Destaque
              </Badge>
            )}
            {product.bestseller && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                <Flame className="h-3 w-3 mr-1 fill-amber-400" />
                Mais Vendido
              </Badge>
            )}
            {!product.available && (
              <Badge variant="outline" className="bg-black/70 text-zinc-300 backdrop-blur-sm">
                Indisponível
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4">
          <h3 className="font-anton text-base sm:text-lg tracking-wide text-dark-text group-hover:text-primary-light transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-dark-muted line-clamp-2">{product.description}</p>
        </div>
      </div>

      {/* Footer / Price & Add Button */}
      <div className="p-3.5 sm:p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {product.promotional && product.promotionalPrice && (
              <span className="text-xs text-dark-muted line-through">
                {formatCurrency(product.price)}
              </span>
            )}
            <span className="font-manrope text-lg sm:text-xl font-bold text-primary">
              {formatCurrency(displayPrice)}
            </span>
          </div>
          
          {product.available && (
            <button
              onClick={handleAdd}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full font-bold transition-all duration-200 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                justAdded
                  ? 'bg-white text-black scale-110 shadow-lime-glow'
                  : 'bg-primary text-black hover:bg-primary-light hover:scale-110 hover:shadow-lime-glow-sm'
              }`}
              disabled={!product.available}
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              {justAdded ? (
                <Check className="h-5 w-5 stroke-[3] text-primary-dark" />
              ) : (
                <Plus className="h-5 w-5 stroke-[2.5]" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
