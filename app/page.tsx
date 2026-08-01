'use client'

import { useState, useEffect } from 'react'
import { Product, Category, CartItem } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { CategoryCard } from '@/components/CategoryCard'
import { ShoppingCart } from '@/components/ShoppingCart'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Share2, QrCode } from 'lucide-react'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ])

      if (!productsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      setProducts(Array.isArray(productsData) ? productsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
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
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado!')
    }
  }

  const handleQRCode = () => {
    window.open(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`,
      '_blank'
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 font-manrope text-dark-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-dark-border bg-dark-bg/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-anton text-3xl text-primary">GALEGO</h1>
              <p className="font-manrope text-sm text-dark-muted">Depósito de Bebidas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleQRCode}>
                <QrCode className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-dark-muted" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <section className="mb-8">
            <h2 className="font-anton text-2xl text-dark-text mb-4">Categorias</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              <CategoryCard
                category={{ id: 'all', name: 'Todos', description: '', icon: '📦', order: 0 }}
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
          <section className="mb-8">
            <h2 className="font-anton text-2xl text-dark-text mb-4">Destaques</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
          <section className="mb-8">
            <h2 className="font-anton text-2xl text-dark-text mb-4">Mais Vendidos</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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

        {/* All Products */}
        <section>
          <h2 className="font-anton text-2xl text-dark-text mb-4">
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name
              : 'Todos os Produtos'}
          </h2>
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-dark-muted">
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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
    </div>
  )
}
