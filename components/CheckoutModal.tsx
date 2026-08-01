'use client'

import { useState } from 'react'
import { CartItem, Config } from '@/types'
import { formatCurrency, formatWhatsAppMessage } from '@/lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { X, Loader2 } from 'lucide-react'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  subtotal: number
  onClearCart: () => void
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  subtotal,
  onClearCart,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<Config | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'PIX',
    notes: '',
    couponCode: '',
  })
  const [discount, setDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')

  if (!isOpen) return null

  const deliveryFee = config?.deliveryFee || 0
  const minOrderValue = config?.minOrderValue || 0
  const total = subtotal + deliveryFee - discount

  const handleCouponApply = async () => {
    if (!formData.couponCode.trim()) return

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formData.couponCode, subtotal }),
      })

      const data = await response.json()

      if (data.valid) {
        setDiscount(data.discount)
        setCouponError('')
      } else {
        setCouponError(data.error || 'Cupom inválido')
        setDiscount(0)
      }
    } catch {
      setCouponError('Erro ao validar cupom')
      setDiscount(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (subtotal < minOrderValue) {
      alert(`Valor mínimo de pedido: ${formatCurrency(minOrderValue)}`)
      return
    }

    setLoading(true)

    try {
      // Fetch config if not loaded
      if (!config) {
        const configRes = await fetch('/api/config')
        const configData = await configRes.json()
        setConfig(configData)
      }

      const finalConfig = config || await (await fetch('/api/config')).json()

      const order = {
        items,
        subtotal,
        deliveryFee,
        discount,
        couponCode: discount > 0 ? formData.couponCode : undefined,
        total,
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      }

      const message = formatWhatsAppMessage(order, finalConfig)
      const whatsappUrl = `https://wa.me/${finalConfig.whatsapp}?text=${encodeURIComponent(message)}`

      window.open(whatsappUrl, '_blank')
      onClearCart()
      onClose()
    } catch {
      alert('Erro ao processar pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg bg-dark-card rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between border-b border-dark-border p-4 bg-dark-card">
          <h2 className="font-anton text-2xl text-dark-text">Finalizar Pedido</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-dark-border">
            <X className="h-6 w-6 text-dark-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4 space-y-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-dark-muted">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="text-dark-text">
                    {formatCurrency(
                      (item.product.promotional && item.product.promotionalPrice
                        ? item.product.promotionalPrice
                        : item.product.price) * item.quantity
                    )}
                  </span>
                </div>
              ))}
              <div className="border-t border-dark-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-dark-muted">Subtotal</span>
                  <span className="text-dark-text">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-muted">Taxa de entrega</span>
                  <span className="text-dark-text">{formatCurrency(deliveryFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Desconto</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-dark-border">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coupon */}
          <div className="flex gap-2">
            <Input
              placeholder="Cupom de desconto"
              value={formData.couponCode}
              onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handleCouponApply}>
              Aplicar
            </Button>
          </div>
          {couponError && (
            <p className="text-sm text-red-500">{couponError}</p>
          )}

          {/* Customer Info */}
          <div className="space-y-3">
            <Input
              placeholder="Seu nome"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Seu telefone (WhatsApp)"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              placeholder="Endereço de entrega"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <select
              className="flex h-10 w-full rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="PIX">PIX</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
            </select>
            <Input
              placeholder="Observações (opcional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {subtotal < minOrderValue && (
            <p className="text-sm text-orange-500">
              Valor mínimo de pedido: {formatCurrency(minOrderValue)}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || subtotal < minOrderValue}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Enviar pedido pelo WhatsApp'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
