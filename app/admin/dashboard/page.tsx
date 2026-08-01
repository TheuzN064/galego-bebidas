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
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-anton text-2xl text-primary">GALEGO</h1>
              <p className="text-sm text-dark-muted">Painel Administrativo</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-dark-muted hover:bg-dark-border hover:text-dark-text'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
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

  const handleSave = async (coupon: Coupon) => {
    const isNew = !editingCoupon?.id
    // Use coupon code as ID if creating a new coupon
    if (isNew && !coupon.id) {
      coupon.id = coupon.code.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }
    const url = isNew ? '/api/coupons' : `/api/coupons/${coupon.id}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon),
    })

    if (!res.ok) {
      alert('Erro ao salvar cupom. Verifique os campos.')
      return
    }

    setEditingCoupon(null)
    onUpdate()
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
        <h2 className="font-anton text-2xl text-dark-text">Cupons</h2>
        <Button onClick={() => setEditingCoupon({ id: '', code: '', discountType: 'percentage', discountValue: 0, minPurchase: 0, usedCount: 0, expiresAt: '', active: true } as Coupon)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {editingCoupon && (
        <Card>
          <CardContent className="p-6">
            <CouponForm coupon={editingCoupon} onSave={handleSave} onCancel={() => setEditingCoupon(null)} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <h3 className="font-medium text-dark-text">{coupon.code}</h3>
                <p className="text-sm text-dark-muted">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue}`} de desconto
                </p>
                <p className="text-sm text-dark-muted">Mínimo: R$ {coupon.minPurchase} | Usos: {coupon.usedCount}</p>
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
        ))}
      </div>
    </div>
  )
}

function CouponForm({ coupon, onSave, onCancel }: { coupon: Coupon, onSave: (coupon: Coupon) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState(coupon)
  const noSpinner = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-5">
      {/* Código e Tipo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Código do Cupom *</label>
          <Input
            placeholder="Ex: PROMO10, FRETE0, NATAL50"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
          />
          <p className="text-xs text-dark-muted">Será convertido automaticamente para maiúsculas</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Tipo de Desconto *</label>
          <select
            className="flex h-10 w-full rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
          >
            <option value="percentage">Porcentagem (%) — Ex: 10% de desconto</option>
            <option value="fixed">Valor Fixo (R$) — Ex: R$ 5,00 de desconto</option>
          </select>
        </div>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
            {formData.discountType === 'percentage' ? 'Desconto (%) *' : 'Desconto (R$) *'}
          </label>
          <Input
            type="number"
            step={formData.discountType === 'percentage' ? '1' : '0.01'}
            min="0"
            max={formData.discountType === 'percentage' ? '100' : undefined}
            placeholder={formData.discountType === 'percentage' ? 'Ex: 10' : 'Ex: 5.00'}
            value={formData.discountValue || ''}
            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
            className={noSpinner}
            required
          />
          <p className="text-xs text-dark-muted">
            {formData.discountType === 'percentage' ? 'Entre 1 e 100%' : 'Valor em reais'}
          </p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Compra Mínima (R$) *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 30.00"
            value={formData.minPurchase || ''}
            onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
            className={noSpinner}
            required
          />
          <p className="text-xs text-dark-muted">0 = sem valor mínimo</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Limite de Usos</label>
          <Input
            type="number"
            min="1"
            placeholder="Ex: 100 (deixe vazio = ilimitado)"
            value={formData.maxUses || ''}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
            className={noSpinner}
          />
          <p className="text-xs text-dark-muted">Vazio = uso ilimitado</p>
        </div>
      </div>

      {/* Data e Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Data de Expiração *</label>
          <Input
            type="date"
            value={formData.expiresAt ? formData.expiresAt.split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, expiresAt: new Date(e.target.value).toISOString() })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Status</label>
          <div className="flex h-10 items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-dark-text">
                {formData.active ? '✅ Cupom ativo (visível para clientes)' : '❌ Cupom inativo (desabilitado)'}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-dark-border">
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Salvar Cupom
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function ConfigTab({ config, onUpdate }: { config: Config | null, onUpdate: () => void }) {
  const [formData, setFormData] = useState(config || {
    storeName: '',
    whatsapp: '',
    address: '',
    hours: '',
    deliveryFee: 0,
    minOrderValue: 0,
    deliveryRadius: 0,
  } as Config)

  const handleSave = async () => {
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    onUpdate()
  }

  return (
    <div className="space-y-6">
      <h2 className="font-anton text-2xl text-dark-text">Configurações</h2>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <Input
            placeholder="Nome da loja"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
          />
          <Input
            placeholder="WhatsApp (com DDD, sem +)"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
          />
          <Input
            placeholder="Endereço"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            placeholder="Horário de funcionamento"
            value={formData.hours}
            onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Taxa de entrega"
            value={formData.deliveryFee}
            onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Valor mínimo de pedido"
            value={formData.minOrderValue}
            onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) })}
          />
          <Input
            type="number"
            placeholder="Raio de entrega (km)"
            value={formData.deliveryRadius}
            onChange={(e) => setFormData({ ...formData, deliveryRadius: parseFloat(e.target.value) })}
          />
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
