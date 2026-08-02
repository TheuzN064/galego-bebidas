'use client'

import { useState, useEffect } from 'react'
import { Product, Category, CartItem, Config } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { CategoryCard } from '@/components/CategoryCard'
import { ShoppingCart } from '@/components/ShoppingCart'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { 
  Search, 
  Share2, 
  QrCode, 
  Zap, 
  Clock, 
  Truck, 
  DollarSign, 
  Flame, 
  Sparkles,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  X
} from 'lucide-react'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ id: number; message: string; product: Product } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, configRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/config'),
      ])

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      const configData = configRes.ok ? await configRes.json() : null

      setProducts(Array.isArray(productsData) ? productsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      if (configData) setConfig(configData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setProducts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = (products || []).filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredProducts = (products || []).filter((p) => p.featured && p.available)
  const bestsellerProducts = (products || []).filter((p) => p.bestseller && p.available)

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { product, quantity: 1 }]
    })

    // Show alert notification
    setToast({
      id: Date.now(),
      message: 'Produto adicionado ao carrinho!',
      product,
    })
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Galego — Depósito de Bebidas',
        text: 'Peça bebidas geladas com entrega rápida no Galego!',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link do cardápio copiado!')
    }
  }

  const handleQRCode = () => {
    window.open(
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.href)}`,
      '_blank'
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-bg">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <img 
              src="/logo.png" 
              alt="Galego Depósito de Bebidas" 
              className="h-20 w-20 rounded-full ring-4 ring-primary/40 shadow-lime-glow animate-pulse mx-auto"
            />
          </div>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="font-manrope text-sm text-dark-muted font-medium">Carregando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text selection:bg-primary selection:text-black">
      {/* Top Ambient Light Effect */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-2xl -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-dark-border bg-dark-bg/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Galego Depósito de Bebidas" 
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-primary shadow-lime-glow-sm"
                />
              </div>
              <div>
                <h1 className="font-anton text-2xl tracking-wider text-white flex items-center gap-1.5">
                  GALEGO
                </h1>
                <p className="font-manrope text-[11px] font-bold tracking-widest text-primary uppercase">
                  - Depósito de Bebidas -
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="h-9 w-9 p-0 rounded-full hover:text-primary"
                title="Compartilhar Cardápio"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleQRCode}
                className="h-9 w-9 p-0 rounded-full hover:text-primary"
                title="QR Code do Cardápio"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner with Logo & Badges */}
      <section className="relative border-b border-dark-border bg-gradient-to-b from-zinc-950 via-dark-card to-dark-bg px-4 py-8 overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Mascot Image */}
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-primary-light to-primary opacity-75 blur group-hover:opacity-100 transition duration-500" />
              <img 
                src="/logo.png" 
                alt="Galego" 
                className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full object-cover ring-2 ring-primary shadow-lime-glow"
              />
            </div>

            {/* Hero Text */}
            <div className="flex-1 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-wide">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                ABERTO E ENTREGANDO AGORA
              </div>
              <h2 className="font-anton text-3xl sm:text-4xl text-white tracking-wide">
                BEBIDAS GELADAS NA SUA PORTA
              </h2>
              <p className="font-manrope text-sm text-dark-muted max-w-lg">
                Cervejas, destilados, combos, gelo e petiscos com entrega rápida e os melhores preços da região.
              </p>

              {/* Info Badges */}
              <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-xs font-medium text-dark-text">
                <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  <span>Taxa: <strong className="text-white">{formatCurrency(config?.deliveryFee || 0)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <DollarSign className="h-3.5 w-3.5 text-primary" />
                  <span>Mínimo: <strong className="text-white">{formatCurrency(config?.minOrderValue || 0)}</strong></span>
                </div>
                {config?.hours && (
                  <div className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{config.hours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto sm:mx-0">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-muted" />
            <Input
              placeholder="Buscar cervejas, destilados, combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 text-base rounded-xl border-zinc-800 bg-zinc-900/90 focus-visible:ring-primary focus-visible:border-primary placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-anton text-2xl tracking-wide text-white flex items-center gap-2">
                <span className="text-primary">#</span> Categorias
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
              <CategoryCard
                category={{ id: 'all', name: 'Todos', description: '', icon: '🍺', order: 0 }}
                isActive={selectedCategory === null}
                onClick={() => setSelectedCategory(null)}
              />
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isActive={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {!searchQuery && !selectedCategory && featuredProducts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary fill-primary/30" />
              <h2 className="font-anton text-2xl tracking-wide text-white">Destaques da Semana</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* Bestsellers */}
        {!searchQuery && !selectedCategory && bestsellerProducts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="h-6 w-6 text-amber-400 fill-amber-400/30" />
              <h2 className="font-anton text-2xl tracking-wide text-white">Mais Vendidos</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {bestsellerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* All / Filtered Products */}
        <section className="mb-12">
          <h2 className="font-anton text-2xl tracking-wide text-white mb-4">
            {selectedCategory
              ? (categories.find((c) => c.id === selectedCategory)?.name || 'Produtos')
              : searchQuery
              ? `Resultados para "${searchQuery}"`
              : 'Todos os Produtos'}
          </h2>
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 p-8 space-y-3">
              <p className="font-anton text-xl text-zinc-400">Nenhum produto encontrado</p>
              <p className="text-sm text-dark-muted">Tente buscar por outro termo ou selecione outra categoria.</p>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedCategory(null) }}>
                Ver todos os produtos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border bg-zinc-950 px-4 py-8 text-center text-dark-muted">
        <div className="container mx-auto max-w-4xl space-y-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <img 
              src="/logo.png" 
              alt="Galego Logo" 
              className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/60 shadow-lime-glow-sm"
            />
            <h3 className="font-anton text-xl text-white">GALEGO</h3>
            <p className="text-xs font-bold tracking-widest text-primary uppercase">- DEPÓSITO DE BEBIDAS -</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {config?.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {config.address}
              </span>
            )}
            {config?.whatsapp && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-primary" />
                WhatsApp: {config.whatsapp}
              </span>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
            <p>© {new Date().getFullYear()} Galego Depósito de Bebidas. Todos os direitos reservados.</p>
            <a 
              href="/admin" 
              className="flex items-center gap-1 text-zinc-500 hover:text-primary transition-colors"
            >
              <Lock className="h-3 w-3" />
              Área Administrativa
            </a>
          </div>
        </div>
      </footer>

      {/* Shopping Cart */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpen={() => setIsCartOpen(true)}
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />

      {/* Floating Alert / Toast Notification */}
      {toast && (
        <div 
          key={toast.id}
          className="fixed bottom-24 right-4 sm:right-6 sm:bottom-8 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          <div className="flex items-center gap-3 p-3.5 bg-zinc-950/95 border border-primary/50 rounded-2xl shadow-[0_10px_35px_rgba(132,204,22,0.25)] backdrop-blur-md text-white">
            {toast.product?.image ? (
              <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                <img 
                  src={toast.product.image} 
                  alt={toast.product.name} 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-primary drop-shadow" />
                </div>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 flex-shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
            
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                {toast.message}
              </p>
              <p className="text-sm font-medium text-white truncate">
                {toast.product?.name || 'Item selecionado'}
              </p>
            </div>

            <button
              onClick={() => {
                setToast(null)
                setIsCartOpen(true)
              }}
              className="px-3 py-1.5 rounded-lg bg-primary text-black text-xs font-bold hover:bg-primary-light transition-all flex-shrink-0 active:scale-95 shadow-sm"
            >
              Ver
            </button>

            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
