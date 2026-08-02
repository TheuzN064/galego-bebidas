'use client'

import { useState, useEffect } from 'react'
import { CartItem, Config, Order } from '@/types'
import { formatCurrency, formatWhatsAppMessage, getWhatsAppUrl } from '@/lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { 
  X, 
  Loader2, 
  MapPin, 
  User, 
  Phone, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Building, 
  Home, 
  Navigation, 
  Send, 
  Check, 
  Search,
  MessageSquare,
  Bike,
  Store,
  Clock,
  ExternalLink,
  AlertCircle
} from 'lucide-react'

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
  
  // Delivery Type: 'delivery' (Entrega) vs 'pickup' (Retirada)
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')

  // Customer & Address state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    reference: '',
    paymentMethod: 'PIX',
    needsChange: false,
    changeFor: '',
    notes: '',
    couponCode: '',
  })

  const [cepLoading, setCepLoading] = useState(false)
  const [cepMessage, setCepMessage] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  // Fetch config on open
  useEffect(() => {
    if (isOpen && !config) {
      fetch('/api/config')
        .then(res => res.json())
        .then(data => setConfig(data))
        .catch(err => console.error('Failed to load store config', err))
    }
  }, [isOpen, config])

  if (!isOpen) return null

  const isPickup = deliveryType === 'pickup'
  const deliveryFee = isPickup ? 0 : (config?.deliveryFee || 0)
  const minOrderValue = isPickup ? 0 : (config?.minOrderValue || 0)
  const total = Math.max(0, subtotal + deliveryFee - discount)

  // Phone input formatting
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11)
    let formatted = raw
    if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`
    }
    if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`
    }
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  // CEP Lookup with ViaCEP
  const searchCep = async (cepInput: string) => {
    const cleanCep = cepInput.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      setCepMessage('CEP deve ter 8 dígitos')
      return
    }

    setCepLoading(true)
    setCepMessage('')

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()

      if (data.erro) {
        setCepMessage('CEP não encontrado. Preencha o endereço manualmente.')
      } else {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: `${data.localidade || ''}${data.uf ? ` - ${data.uf}` : ''}` || prev.city,
        }))
        setCepMessage('✓ Endereço preenchido com sucesso!')
      }
    } catch {
      setCepMessage('Não foi possível buscar o CEP automaticamente.')
    } finally {
      setCepLoading(false)
    }
  }

  const handleCepChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8)
    let formatted = raw
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`
    }
    setFormData(prev => ({ ...prev, cep: formatted }))
    if (raw.length === 8) {
      searchCep(raw)
    } else {
      setCepMessage('')
    }
  }

  // Coupon handling
  const handleCouponApply = async () => {
    if (!formData.couponCode.trim()) return

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: formData.couponCode.trim(), subtotal }),
      })

      const data = await response.json()

      if (data.valid) {
        setDiscount(data.discount)
        setAppliedCoupon(data.couponCode || formData.couponCode.trim().toUpperCase())
        setCouponError('')
      } else {
        setCouponError(data.error || 'Cupom inválido')
        setDiscount(0)
        setAppliedCoupon(null)
      }
    } catch {
      setCouponError('Erro ao validar cupom. Tente novamente.')
      setDiscount(0)
      setAppliedCoupon(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setDiscount(0)
    setAppliedCoupon(null)
    setFormData(prev => ({ ...prev, couponCode: '' }))
    setCouponError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPickup && subtotal < minOrderValue) {
      alert(`Valor mínimo de pedido para entrega: ${formatCurrency(minOrderValue)}`)
      return
    }

    if (!formData.name.trim()) {
      alert('Por favor, informe seu nome.')
      return
    }

    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      alert('Por favor, informe um WhatsApp válido com DDD.')
      return
    }

    if (!isPickup && (!formData.street.trim() || !formData.number.trim() || !formData.neighborhood.trim())) {
      alert('Por favor, preencha os dados completos do endereço de entrega (Rua, Número e Bairro).')
      return
    }

    setLoading(true)

    try {
      const finalConfig = config || await (await fetch('/api/config')).json()

      const appliedCouponCode = appliedCoupon || (discount > 0 ? formData.couponCode.trim() : undefined)

      // Register coupon usage if a valid coupon was applied
      if (appliedCouponCode) {
        fetch('/api/coupons/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedCouponCode }),
        }).catch(err => console.error('Error registering coupon use:', err))
      }

      const order: Order = {
        items,
        subtotal,
        deliveryFee,
        deliveryType,
        discount,
        couponCode: appliedCouponCode,
        total,
        customer: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          deliveryType,
          cep: isPickup ? undefined : formData.cep.trim(),
          street: isPickup ? undefined : formData.street.trim(),
          number: isPickup ? undefined : formData.number.trim(),
          complement: isPickup ? undefined : formData.complement.trim(),
          neighborhood: isPickup ? undefined : formData.neighborhood.trim(),
          city: isPickup ? undefined : formData.city.trim(),
          reference: isPickup ? undefined : formData.reference.trim(),
        },
        paymentMethod: formData.paymentMethod,
        changeFor: formData.paymentMethod === 'Dinheiro' && formData.needsChange ? formData.changeFor : undefined,
        notes: formData.notes.trim(),
      }

      const message = formatWhatsAppMessage(order, finalConfig)
      const whatsappUrl = getWhatsAppUrl(finalConfig.whatsapp || '', message)

      window.open(whatsappUrl, '_blank')
      onClearCart()
      onClose()
    } catch (err) {
      console.error('Order submission error:', err)
      alert('Erro ao processar pedido')
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { id: 'PIX', label: 'PIX', icon: QrCode, desc: 'Chave enviada no WhatsApp' },
    { id: 'Cartão de Crédito', label: 'Crédito', icon: CreditCard, desc: isPickup ? 'Máquina no balcão' : 'Máquina na entrega' },
    { id: 'Cartão de Débito', label: 'Débito', icon: CreditCard, desc: isPickup ? 'Máquina no balcão' : 'Máquina na entrega' },
    { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote, desc: isPickup ? 'Pagamento no balcão' : 'Pagamento na entrega' },
  ]

  const storeAddress = config?.address || 'Rua das Bebidas, 123 - Centro'
  const storeHours = config?.hours || 'Seg-Sex: 9h-20h | Sáb: 9h-18h'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 bg-zinc-900/90 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Galego" 
              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary shadow-lime-glow-sm" 
            />
            <div>
              <h2 className="font-anton text-xl text-white tracking-wide">FINALIZAR PEDIDO</h2>
              <p className="text-[11px] font-bold text-primary tracking-widest uppercase">GALEGO — DEPÓSITO DE BEBIDAS</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors" 
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Store Closed Warning Banner */}
          {config?.isOpen === false && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="block font-bold text-amber-200">A loja está fechada no momento</strong>
                <p className="text-zinc-300">{config.closedMessage || 'Seu pedido será recebido e atendido assim que abrirmos!'}</p>
                {config.hours && <p className="text-[11px] text-zinc-400">🕒 Horário: {config.hours}</p>}
              </div>
            </div>
          )}

          {/* 1. Delivery Type Selection (Entrega vs Retirada) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Como deseja receber seu pedido?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option: Delivery */}
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`relative flex flex-col items-center text-center p-3.5 rounded-xl border transition-all duration-200 ${
                  deliveryType === 'delivery'
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-lime-glow-sm text-white'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className={`p-2 rounded-full mb-1.5 ${deliveryType === 'delivery' ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Bike className="h-5 w-5" />
                </div>
                <span className="font-anton text-sm tracking-wide">Entrega Delivery</span>
                <span className="text-[11px] text-zinc-400 mt-0.5">
                  {config?.deliveryFee ? `Taxa de ${formatCurrency(config.deliveryFee)}` : 'Receba em casa'}
                </span>
                {deliveryType === 'delivery' && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>

              {/* Option: Pickup */}
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`relative flex flex-col items-center text-center p-3.5 rounded-xl border transition-all duration-200 ${
                  deliveryType === 'pickup'
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/40 shadow-lime-glow-sm text-white'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span className="absolute -top-2 right-2 bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  GRÁTIS
                </span>
                <div className={`p-2 rounded-full mb-1.5 ${deliveryType === 'pickup' ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Store className="h-5 w-5" />
                </div>
                <span className="font-anton text-sm tracking-wide">Retirar na Loja</span>
                <span className="text-[11px] text-primary font-semibold mt-0.5">Sem taxa de entrega</span>
                {deliveryType === 'pickup' && (
                  <div className="absolute top-2 left-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Order Summary */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Resumo da Compra</span>
              <span className="text-xs text-primary font-semibold">{items.reduce((s, i) => s + i.quantity, 0)} itens</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {items.map((item) => {
                const unitPrice = item.product.promotional && item.product.promotionalPrice
                  ? item.product.promotionalPrice
                  : item.product.price
                return (
                  <div key={item.product.id} className="flex justify-between text-xs py-0.5">
                    <span className="text-zinc-300 line-clamp-1">
                      <strong className="text-primary">{item.quantity}x</strong> {item.product.name}
                    </span>
                    <span className="text-zinc-200 font-mono font-medium flex-shrink-0 ml-2">
                      {formatCurrency(unitPrice * item.quantity)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-zinc-800/80 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tipo de Pedido</span>
                <span className="text-zinc-200 font-medium">
                  {isPickup ? 'Retirada na Loja (Grátis)' : `Entrega (${formatCurrency(deliveryFee)})`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>Desconto de Cupom</span>
                  <span className="font-mono">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-anton text-lg pt-2 border-t border-zinc-800 text-white">
                <span>TOTAL</span>
                <span className="text-primary font-mono font-bold tracking-wide">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* 3. Coupon Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <span>🎟️</span> Cupom de Desconto
            </label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span className="text-xs font-bold">Cupom {appliedCoupon} aplicado!</span>
                  <span className="text-[11px] bg-primary text-black font-bold px-2 py-0.5 rounded-md">
                    -{formatCurrency(discount)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <Input
                    placeholder="Código (ex: PRIMEIRA10)"
                    value={formData.couponCode}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase().replace(/\s+/g, '') }))
                      if (couponError) setCouponError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCouponApply()
                      }
                    }}
                    className="flex-1 bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCouponApply}
                    disabled={validatingCoupon || !formData.couponCode.trim()}
                    className="h-10 px-4 text-xs font-bold border-zinc-700 hover:border-primary hover:text-primary"
                  >
                    {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-400 font-medium">⚠️ {couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* 4. Customer Personal Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-zinc-800/80 pb-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Seus Dados</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Nome Completo <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Ex: João da Silva"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-9 bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  WhatsApp (com DDD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="(00) 00000-0000"
                    required
                    type="tel"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="pl-9 bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Address OR Store Pickup Details */}
          {isPickup ? (
            /* STORE PICKUP DETAILS CARD */
            <div className="rounded-2xl border border-primary/40 bg-zinc-900/90 p-4 space-y-3 shadow-lime-glow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-primary font-anton text-base tracking-wide border-b border-zinc-800 pb-2">
                <Store className="h-5 w-5" />
                <span>LOCAL PARA RETIRADA</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-[11px] uppercase font-bold text-zinc-400">Endereço da Loja:</p>
                  <p className="font-semibold text-white text-sm mt-0.5 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{storeAddress}</span>
                  </p>
                </div>

                {storeHours && (
                  <div>
                    <p className="text-[11px] uppercase font-bold text-zinc-400">Horário de Funcionamento:</p>
                    <p className="text-zinc-300 mt-0.5 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{storeHours}</span>
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-primary hover:text-primary-light text-xs font-bold transition-all border border-zinc-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Ver no Google Maps / Traçar Rota</span>
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary-light text-[11px] leading-relaxed">
                  💡 <strong>Como funciona:</strong> Ao clicar no botão abaixo, seu pedido será enviado pelo WhatsApp. A equipe irá separar os itens e avisar quando estiver pronto para você retirar no balcão!
                </div>
              </div>
            </div>
          ) : (
            /* DELIVERY ADDRESS FIELDS */
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Endereço de Entrega</span>
                </h3>
                <span className="text-[10px] text-zinc-500">Campos completos</span>
              </div>

              {/* CEP with auto-complete */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-medium text-zinc-400">
                    CEP (opcional para preenchimento rápido)
                  </label>
                  {cepLoading && (
                    <span className="text-[10px] text-primary flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Buscando endereço...
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      placeholder="00000-000"
                      inputMode="numeric"
                      value={formData.cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="pl-9 bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => searchCep(formData.cep)}
                    disabled={cepLoading || formData.cep.replace(/\D/g, '').length !== 8}
                    className="h-10 px-3 text-xs border-zinc-700 hover:border-primary"
                  >
                    <Search className="h-3.5 w-3.5 mr-1" /> Buscar
                  </Button>
                </div>
                {cepMessage && (
                  <p className={`text-[11px] mt-1 font-medium ${cepMessage.startsWith('✓') ? 'text-primary' : 'text-amber-400'}`}>
                    {cepMessage}
                  </p>
                )}
              </div>

              {/* Street / Logradouro */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Rua / Avenida / Logradouro <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Ex: Rua das Flores, Av. Brasil"
                    required={!isPickup}
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    className="pl-9 bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                  />
                </div>
              </div>

              {/* Number & Complement in 2 Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    Número <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      placeholder="Ex: 123 ou S/N"
                      required={!isPickup}
                      value={formData.number}
                      onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      className="pl-9 bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    Complemento
                  </label>
                  <Input
                    placeholder="Apto 102, Bloco B..."
                    value={formData.complement}
                    onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                  />
                </div>
              </div>

              {/* Neighborhood & City in 2 Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    Bairro <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="Ex: Centro, Bessa"
                    required={!isPickup}
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    Cidade / UF
                  </label>
                  <Input
                    placeholder="Ex: João Pessoa - PB"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                  />
                </div>
              </div>

              {/* Reference Point */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Ponto de Referência (opcional)
                </label>
                <Input
                  placeholder="Ex: Em frente à padaria, portão preto"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
                />
              </div>
            </div>
          )}

          {/* 6. Payment Method */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 border-b border-zinc-800/80 pb-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <span>Forma de Pagamento</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                const isSelected = formData.paymentMethod === method.id
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-white ring-1 ring-primary/50 shadow-[0_0_15px_rgba(132,204,22,0.12)]'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-zinc-500'}`} />
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-zinc-300'}`}>{method.label}</p>
                      <p className="text-[10px] text-zinc-500">{method.desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Change for cash */}
            {formData.paymentMethod === 'Dinheiro' && (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 animate-fadeIn">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsChange}
                    onChange={(e) => setFormData(prev => ({ ...prev, needsChange: e.target.checked }))}
                    className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800 h-4 w-4"
                  />
                  <span className="text-xs text-zinc-300 font-medium">Precisa de troco?</span>
                </label>

                {formData.needsChange && (
                  <div className="pt-1">
                    <label className="text-[11px] text-zinc-400 block mb-1">Troco para quanto?</label>
                    <Input
                      placeholder="Ex: 50,00 ou 100,00"
                      inputMode="numeric"
                      value={formData.changeFor}
                      onChange={(e) => setFormData(prev => ({ ...prev, changeFor: e.target.value }))}
                      className="bg-zinc-950 border-zinc-800 text-sm focus-visible:ring-primary h-9"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. Order Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>Observações (opcional)</span>
            </label>
            <Input
              placeholder="Ex: Bebidas bem geladas por favor, embalagem para presente..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="bg-zinc-900 border-zinc-800 text-sm focus-visible:ring-primary h-10"
            />
          </div>

          {!isPickup && subtotal < minOrderValue && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium text-center">
              ⚠️ Valor mínimo para entrega: <strong>{formatCurrency(minOrderValue)}</strong>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-anton tracking-wider text-black bg-primary hover:bg-primary-light transition-all shadow-lime-glow flex items-center justify-center gap-2 rounded-xl"
            disabled={loading || (!isPickup && subtotal < minOrderValue)}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-black" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5 stroke-[2.5]" />
                <span>ENVIAR PEDIDO PELO WHATSAPP</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
