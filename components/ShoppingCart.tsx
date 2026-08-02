'use client'

import { useState } from 'react'
import { CartItem } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from './ui/button'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { CheckoutModal } from './CheckoutModal'

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
}

export function ShoppingCart({
  isOpen,
  onClose,
  onOpen,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: ShoppingCartProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.promotional && item.product.promotionalPrice 
      ? item.product.promotionalPrice 
      : item.product.price) * item.quantity,
    0
  )

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-black shadow-[0_0_30px_rgba(132,204,22,0.4)] transition-all duration-300 hover:bg-primary-light hover:scale-110 active:scale-95"
        aria-label="Ver carrinho"
      >
        <ShoppingBag className="h-7 w-7 stroke-[2.2]" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black border-2 border-primary text-primary text-xs font-black shadow-md">
            {itemCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <div className="fixed right-0 top-0 h-full w-full max-w-md bg-dark-card shadow-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dark-border p-4">
              <h2 className="font-anton text-2xl text-dark-text">Carrinho</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-dark-border"
              >
                <X className="h-6 w-6 text-dark-text" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-dark-muted">
                  <ShoppingBag className="h-16 w-16 mb-4" />
                  <p className="font-manrope">Seu carrinho está vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 rounded-lg border border-dark-border bg-dark-bg p-3"
                    >
                      <img
                        src={item.product.image || '/logo.png'}
                        alt={item.product.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/logo.png'
                        }}
                        className="h-20 w-20 rounded-lg object-cover"
                      />

                      <div className="flex-1">
                        <h3 className="font-manrope font-medium text-dark-text">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-primary">
                          {formatCurrency(
                            item.product.promotional && item.product.promotionalPrice
                              ? item.product.promotionalPrice
                              : item.product.price
                          )}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-border hover:bg-dark-border/80"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-manrope text-dark-text">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-dark-border hover:bg-dark-border/80"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="ml-auto rounded-lg p-2 text-red-500 hover:bg-dark-border"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-dark-border p-4">
                <div className="mb-4 flex justify-between">
                  <span className="font-manrope text-dark-muted">Subtotal</span>
                  <span className="font-manrope font-bold text-dark-text">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onClearCart}
                  >
                    Limpar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setIsCheckoutOpen(true)}
                  >
                    Finalizar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={items}
        subtotal={subtotal}
        onClearCart={onClearCart}
      />
    </>
  )
}
