'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product, Category, Coupon, Config } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Ticket, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react'

type Tab = 'overview' | 'products' | 'categories' | 'coupons' | 'config'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, couponsRes, configRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/coupons'),
        fetch('/api/config'),
      ])

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      const couponsData = await couponsRes.json()
      const configData = await configRes.json()

      setProducts(productsData)
      setCategories(categoriesData)
      setCoupons(couponsData)
      setConfig(configData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'products' as Tab, label: 'Produtos', icon: Package },
    { id: 'categories' as Tab, label: 'Categorias', icon: Tags },
    { id: 'coupons' as Tab, label: 'Cupons', icon: Ticket },
    { id: 'config' as Tab, label: 'Configurações', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-primary selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-dark-border bg-dark-card/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Galego" 
                className="h-10 w-10 rounded-full object-cover ring-2 ring-primary shadow-lime-glow-sm"
              />
              <div>
                <h1 className="font-anton text-xl tracking-wide text-white">GALEGO</h1>
                <p className="font-manrope text-[10px] font-bold tracking-widest text-primary uppercase">
                  - Depósito de Bebidas -
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="/" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-dark-muted hover:text-primary transition-colors px-3 py-2 rounded-lg border border-dark-border bg-dark-bg font-medium"
              >
                Ver Catálogo ↗
              </a>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300">
                <LogOut className="h-4 w-4 mr-1.5" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all text-sm font-semibold whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-black shadow-lime-glow-sm'
                      : 'text-dark-muted hover:bg-zinc-800/60 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-5 w-5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1">
            {activeTab === 'overview' && <OverviewTab products={products} categories={categories} coupons={coupons} />}
            {activeTab === 'products' && <ProductsTab products={products} categories={categories} onUpdate={fetchData} />}
            {activeTab === 'categories' && <CategoriesTab categories={categories} onUpdate={fetchData} />}
            {activeTab === 'coupons' && <CouponsTab coupons={coupons} onUpdate={fetchData} />}
            {activeTab === 'config' && <ConfigTab config={config} onUpdate={fetchData} />}
          </main>
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ products, categories, coupons }: { products: Product[], categories: Category[], coupons: Coupon[] }) {
  return (
    <div className="space-y-6">
      <h2 className="font-anton text-2xl text-dark-text">Visão Geral</h2>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-muted">Produtos</p>
                <p className="text-3xl font-bold text-dark-text">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-muted">Categorias</p>
                <p className="text-3xl font-bold text-dark-text">{categories.length}</p>
              </div>
              <Tags className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-muted">Cupons</p>
                <p className="text-3xl font-bold text-dark-text">{coupons.length}</p>
              </div>
              <Ticket className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-muted">Produtos Ativos</p>
                <p className="text-3xl font-bold text-dark-text">{products.filter(p => p.available).length}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProductsTab({ products, categories, onUpdate }: { products: Product[], categories: Category[], onUpdate: () => void }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleSave = async (product: Product) => {
    const isNew = !editingProduct?.id
    // Auto-generate ID from name if creating a new product
    if (isNew && !product.id) {
      product.id = product.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        + '-' + Date.now()
    }
    const url = isNew ? '/api/products' : `/api/products/${product.id}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })

    if (!res.ok) {
      alert('Erro ao salvar produto. Verifique os campos.')
      return
    }

    setEditingProduct(null)
    onUpdate()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      onUpdate()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-anton text-2xl text-dark-text">Produtos</h2>
        <Button onClick={() => setEditingProduct({ id: '', name: '', description: '', price: 0, category: '', image: '', available: true, featured: false, bestseller: false } as Product)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {editingProduct && (
        <Card>
          <CardContent className="p-6">
            <ProductForm product={editingProduct} categories={categories} onSave={handleSave} onCancel={() => setEditingProduct(null)} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <img src={product.image} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-medium text-dark-text">{product.name}</h3>
                <p className="text-sm text-dark-muted">{product.description}</p>
                <p className="text-sm text-primary">R$ {product.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ProductForm({ product, categories, onSave, onCancel }: { product: Product, categories: Category[], onSave: (product: Product) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState(product)

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Nome do Produto *</label>
          <Input
            placeholder="Ex: Skol Lata 350ml"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Preço (R$) *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 9.90"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Descrição *</label>
        <Input
          placeholder="Ex: Cerveja Skol lata bem gelada, 350ml"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Categoria *</label>
        <select
          className="flex h-10 w-full rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        >
          <option value="">Selecione uma categoria...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">URL da Imagem *</label>
        <Input
          placeholder="Ex: https://meusite.com/imagens/skol.png"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
        />
      </div>
      <div className="rounded-lg border border-dark-border p-4 space-y-2">
        <p className="text-xs font-medium text-dark-muted uppercase tracking-wider">Opções</p>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="accent-primary"
            />
            <span className="text-sm text-dark-text">Disponível para venda</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="accent-primary"
            />
            <span className="text-sm text-dark-text">Em destaque</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.bestseller}
              onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
              className="accent-primary"
            />
            <span className="text-sm text-dark-text">Mais vendido</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Salvar Produto
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function CategoriesTab({ categories, onUpdate }: { categories: Category[], onUpdate: () => void }) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleSave = async (category: Category) => {
    const isNew = !editingCategory?.id
    // Auto-generate ID from name if creating a new category
    if (isNew && !category.id) {
      category.id = category.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
    const url = isNew ? '/api/categories' : `/api/categories/${category.id}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    })

    if (!res.ok) {
      alert('Erro ao salvar categoria. Verifique os campos.')
      return
    }

    setEditingCategory(null)
    onUpdate()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      onUpdate()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-anton text-2xl text-dark-text">Categorias</h2>
        <Button onClick={() => setEditingCategory({ id: '', name: '', description: '', icon: '', order: categories.length } as Category)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {editingCategory && (
        <Card>
          <CardContent className="p-6">
            <CategoryForm category={editingCategory} onSave={handleSave} onCancel={() => setEditingCategory(null)} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className="text-3xl">{category.icon}</span>
              <div className="flex-1">
                <h3 className="font-medium text-dark-text">{category.name}</h3>
                <p className="text-sm text-dark-muted">{category.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingCategory(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CategoryForm({ category, onSave, onCancel }: { category: Category, onSave: (category: Category) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState(category)

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Nome da Categoria *</label>
          <Input
            placeholder="Ex: Cervejas, Vinhos, Destilados"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Ícone (Emoji) *</label>
          <Input
            placeholder="Ex: 🍺 🍷 🥃"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Descrição</label>
        <Input
          placeholder="Ex: Cervejas nacionais e importadas geladas"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Salvar Categoria
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function CouponsTab({ coupons, onUpdate }: { coupons: Coupon[], onUpdate: () => void }) {
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async (coupon: Coupon) => {
    setSaving(true)
    try {
      const isNew = !editingCoupon?.id
      if (isNew && !coupon.id) {
        coupon.id = coupon.code.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `coupon-${Date.now()}`
      }
      const url = isNew ? '/api/coupons' : `/api/coupons/${coupon.id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Erro ao salvar cupom. Verifique os campos.')
        return
      }

      setEditingCoupon(null)
      onUpdate()
    } catch {
      alert('Erro de conexão ao salvar cupom.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
      onUpdate()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-anton text-2xl text-dark-text">Cupons de Desconto</h2>
          <p className="text-sm text-dark-muted">Crie e gerencie códigos promocionais para seus clientes</p>
        </div>
        <Button onClick={() => setEditingCoupon({
          id: '',
          code: '',
          discountType: 'percentage',
          discountValue: 10,
          minPurchase: 0,
          usedCount: 0,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          active: true
        } as Coupon)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {editingCoupon && (
        <Card className="border border-dark-border bg-dark-card/60">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg text-dark-text mb-4">
              {editingCoupon.id ? 'Editar Cupom' : 'Criar Novo Cupom'}
            </h3>
            <CouponForm coupon={editingCoupon} onSave={handleSave} onCancel={() => setEditingCoupon(null)} saving={saving} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {coupons.map((coupon) => {
          const isExpired = coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()
          return (
            <Card key={coupon.id} className="border border-dark-border bg-dark-card/60">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-primary tracking-wide">{coupon.code}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      coupon.active && !isExpired
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {!coupon.active ? 'Inativo' : isExpired ? 'Expirado' : 'Ativo'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-dark-text">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `R$ ${coupon.discountValue.toFixed(2)} de desconto`}
                  </p>
                  <p className="text-xs text-dark-muted">
                    Mínimo: {coupon.minPurchase > 0 ? `R$ ${coupon.minPurchase.toFixed(2)}` : 'Sem mínimo'} • Usos: {coupon.usedCount || 0}{coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                  </p>
                  {coupon.expiresAt && (
                    <p className="text-xs text-dark-muted">
                      Válido até: {new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingCoupon(coupon)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(coupon.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function CouponForm({
  coupon,
  onSave,
  onCancel,
  saving = false
}: {
  coupon: Coupon
  onSave: (coupon: Coupon) => void
  onCancel: () => void
  saving?: boolean
}) {
  const [formData, setFormData] = useState<Coupon>(() => ({
    ...coupon,
    expiresAt: coupon.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  }))
  const noSpinner = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

  const dateValue = formData.expiresAt
    ? formData.expiresAt.split('T')[0]
    : new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-5">
      {/* Código e Tipo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Código do Cupom *</label>
          <Input
            placeholder="Ex: PROMO10, FRETEGRATIS, NATAL50"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
            required
          />
          <p className="text-xs text-dark-muted">Código que o cliente digitará no carrinho</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Tipo de Desconto *</label>
          <select
            className="flex h-10 w-full rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
          >
            <option value="percentage">Porcentagem (%) — Ex: 10% de desconto</option>
            <option value="fixed">Valor Fixo (R$) — Ex: R$ 5,00 de desconto</option>
          </select>
          <p className="text-xs text-dark-muted">Escolha se o desconto é percentual ou em reais</p>
        </div>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
            {formData.discountType === 'percentage' ? 'Valor do Desconto (%) *' : 'Valor do Desconto (R$) *'}
          </label>
          <Input
            type="number"
            step={formData.discountType === 'percentage' ? '1' : '0.01'}
            min="0.01"
            max={formData.discountType === 'percentage' ? '100' : undefined}
            placeholder={formData.discountType === 'percentage' ? 'Ex: 10' : 'Ex: 5.00'}
            value={formData.discountValue || ''}
            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
            className={noSpinner}
            required
          />
          <p className="text-xs text-dark-muted">
            {formData.discountType === 'percentage' ? 'Entre 1% e 100%' : 'Valor em reais'}
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Compra Mínima (R$)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 30.00"
            value={formData.minPurchase || ''}
            onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
            className={noSpinner}
          />
          <p className="text-xs text-dark-muted">0 ou vazio = sem valor mínimo</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Limite de Usos</label>
          <Input
            type="number"
            min="1"
            placeholder="Ex: 100"
            value={formData.maxUses || ''}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
            className={noSpinner}
          />
          <p className="text-xs text-dark-muted">Vazio = uso ilimitado</p>
        </div>
      </div>

      {/* Data e Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Data de Expiração *</label>
          <Input
            type="date"
            value={dateValue}
            onChange={(e) => {
              if (e.target.value) {
                setFormData({ ...formData, expiresAt: `${e.target.value}T23:59:59.999Z` })
              }
            }}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <p className="text-xs text-dark-muted">Válido até às 23:59 da data selecionada</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Status do Cupom</label>
          <div className="flex h-10 items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-dark-text font-medium">
                {formData.active ? '✅ Cupom Ativo' : '❌ Cupom Desativado'}
              </span>
            </label>
          </div>
          <p className="text-xs text-dark-muted">Desative para pausar o cupom temporariamente</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-dark-border">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Cupom'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function ConfigTab({ config, onUpdate }: { config: Config | null, onUpdate: () => void }) {
  const [formData, setFormData] = useState<Config>(config || {
    storeName: '',
    whatsapp: '',
    address: '',
    hours: '',
    deliveryFee: 0,
    minOrderValue: 0,
    deliveryRadius: 0,
  })
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData(config)
    }
  }, [config])

  const noSpinner = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setSavedSuccess(false)
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      setSavedSuccess(true)
      onUpdate()
      setTimeout(() => setSavedSuccess(false), 4000)
    } catch {
      alert('Erro ao salvar as configurações. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-anton text-2xl text-dark-text">Configurações da Loja</h2>
          <p className="text-sm text-dark-muted">Personalize as informações públicas, atendimento e regras de entrega</p>
        </div>
        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium animate-fadeIn">
            ✓ Configurações salvas com sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Seção 1: Dados da Loja */}
        <Card className="border border-dark-border bg-dark-card/60">
          <CardContent className="p-6 space-y-4">
            <div className="border-b border-dark-border/60 pb-3">
              <h3 className="text-base font-semibold text-dark-text flex items-center gap-2">
                <span>🏪</span> Identificação da Loja
              </h3>
              <p className="text-xs text-dark-muted mt-0.5">Nome e localização física da sua empresa</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Nome da Loja *
                </label>
                <Input
                  placeholder="Ex: Galego — Depósito de Bebidas"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                />
                <p className="text-xs text-dark-muted">Exibido no topo do site e nas mensagens</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Endereço Completo *
                </label>
                <Input
                  placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo - SP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
                <p className="text-xs text-dark-muted">Visível no rodapé e informações de contato</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Atendimento e Contato */}
        <Card className="border border-dark-border bg-dark-card/60">
          <CardContent className="p-6 space-y-4">
            <div className="border-b border-dark-border/60 pb-3">
              <h3 className="text-base font-semibold text-dark-text flex items-center gap-2">
                <span>📱</span> Atendimento & WhatsApp
              </h3>
              <p className="text-xs text-dark-muted mt-0.5">Canal de recebimento dos pedidos e expediente</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                  WhatsApp para Pedidos *
                </label>
                <Input
                  placeholder="Ex: 5511999999999 (com DDD, somente números)"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                  required
                />
                <p className="text-xs text-dark-muted">
                  Código do país (55) + DDD + Número. Ex: <span className="text-primary font-mono">5511987654321</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Horário de Funcionamento *
                </label>
                <Input
                  placeholder="Ex: Seg a Sex: 09h às 22h | Sáb e Dom: 09h às 00h"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  required
                />
                <p className="text-xs text-dark-muted">Informado aos clientes no cabeçalho e rodapé</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Regras de Entrega */}
        <Card className="border border-dark-border bg-dark-card/60">
          <CardContent className="p-6 space-y-4">
            <div className="border-b border-dark-border/60 pb-3">
              <h3 className="text-base font-semibold text-dark-text flex items-center gap-2">
                <span>🛵</span> Regras de Entrega & Pedidos
              </h3>
              <p className="text-xs text-dark-muted mt-0.5">Valores aplicados automaticamente no carrinho</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Taxa de Entrega (R$) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 5.00"
                  value={formData.deliveryFee || ''}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })}
                  className={noSpinner}
                  required
                />
                <p className="text-xs text-dark-muted">0 = Frete grátis padrão</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Valor Mínimo do Pedido (R$) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 20.00"
                  value={formData.minOrderValue || ''}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
                  className={noSpinner}
                  required
                />
                <p className="text-xs text-dark-muted">0 = Sem valor mínimo</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Raio Máximo de Entrega (km) *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ex: 10"
                  value={formData.deliveryRadius || ''}
                  onChange={(e) => setFormData({ ...formData, deliveryRadius: parseFloat(e.target.value) || 0 })}
                  className={noSpinner}
                  required
                />
                <p className="text-xs text-dark-muted">Distância limite para entrega</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving} className="px-6">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          {savedSuccess && (
            <span className="text-sm text-green-400 font-medium animate-fadeIn">
              Alterações aplicadas com sucesso!
            </span>
          )}
        </div>
      </form>
    </div>
  )
}

