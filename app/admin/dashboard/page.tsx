'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product, Category, Coupon, Config, ScheduleDay } from '@/types'
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
  Save,
  Clock,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  Store,
  Sparkles,
  Calendar,
  Power
} from 'lucide-react'

type Tab = 'overview' | 'products' | 'categories' | 'coupons' | 'schedules' | 'config'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingStatus, setTogglingStatus] = useState(false)

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

  // Quick 1-click status toggle from the header
  const handleQuickToggleStore = async () => {
    if (!config || togglingStatus) return
    setTogglingStatus(true)
    const newStatus = config.isOpen === false ? true : false
    const updatedConfig: Config = { ...config, isOpen: newStatus }

    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      })
      if (res.ok) {
        setConfig(updatedConfig)
      } else {
        alert('Erro ao atualizar status da loja.')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao atualizar status.')
    } finally {
      setTogglingStatus(false)
    }
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'schedules' as Tab, label: 'Status & Horários', icon: Clock },
    { id: 'products' as Tab, label: 'Produtos', icon: Package },
    { id: 'categories' as Tab, label: 'Categorias', icon: Tags },
    { id: 'coupons' as Tab, label: 'Cupons', icon: Ticket },
    { id: 'config' as Tab, label: 'Configurações', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-bg">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lime-glow" />
      </div>
    )
  }

  const isStoreOpen = config?.isOpen !== false

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-primary selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-dark-border bg-dark-card/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
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

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live Store Status Switch */}
              <button
                onClick={handleQuickToggleStore}
                disabled={togglingStatus}
                title={isStoreOpen ? 'Clique para FECHAR a loja' : 'Clique para ABRIR a loja'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
                  isStoreOpen
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${isStoreOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <span className="hidden sm:inline">{isStoreOpen ? 'Loja Aberta' : 'Loja Fechada'}</span>
                <span className="sm:hidden">{isStoreOpen ? 'Aberta' : 'Fechada'}</span>
                <span className="text-[10px] opacity-75 font-normal">({isStoreOpen ? 'Fechar' : 'Abrir'})</span>
              </button>

              <a 
                href="/" 
                target="_blank" 
                rel="noreferrer"
                className="hidden md:inline-flex text-xs text-dark-muted hover:text-primary transition-colors px-3 py-2 rounded-lg border border-dark-border bg-dark-bg font-medium"
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
            {activeTab === 'overview' && <OverviewTab products={products} categories={categories} coupons={coupons} config={config} />}
            {activeTab === 'schedules' && <SchedulesTab config={config} onUpdate={fetchData} />}
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

function OverviewTab({ products, categories, coupons, config }: { products: Product[], categories: Category[], coupons: Coupon[], config: Config | null }) {
  const isStoreOpen = config?.isOpen !== false

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-anton text-2xl text-dark-text">Visão Geral</h2>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
          isStoreOpen
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <span className={`h-2 w-2 rounded-full ${isStoreOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          {isStoreOpen ? '🟢 Loja Aberta (Recebendo Pedidos)' : '🔴 Loja Fechada (Pausada)'}
        </div>
      </div>
      
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

/* =========================================================================
   STATUS, AVISOS E HORÁRIOS DA LOJA (SchedulesTab)
========================================================================= */
function SchedulesTab({ config, onUpdate }: { config: Config | null, onUpdate: () => void }) {
  const defaultSchedules: ScheduleDay[] = [
    { day: 'Segunda-feira', openTime: '09:00', closeTime: '22:00', closed: false },
    { day: 'Terça-feira', openTime: '09:00', closeTime: '22:00', closed: false },
    { day: 'Quarta-feira', openTime: '09:00', closeTime: '22:00', closed: false },
    { day: 'Quinta-feira', openTime: '09:00', closeTime: '23:00', closed: false },
    { day: 'Sexta-feira', openTime: '09:00', closeTime: '02:00', closed: false },
    { day: 'Sábado', openTime: '09:00', closeTime: '02:00', closed: false },
    { day: 'Domingo', openTime: '09:00', closeTime: '20:00', closed: false },
  ]

  const [formData, setFormData] = useState<Config>(config || {
    storeName: 'Galego — Depósito de Bebidas',
    whatsapp: '',
    address: '',
    hours: 'Seg a Sex: 09h às 22h | Sáb e Dom: 09h às 02h',
    deliveryFee: 0,
    minOrderValue: 0,
    deliveryRadius: 0,
    isOpen: true,
    closedMessage: 'Estamos fechados no momento. Você ainda pode consultar nossos produtos e montar seu pedido!',
    announcement: '',
    announcementActive: false,
    schedules: defaultSchedules,
  })

  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData({
        ...config,
        isOpen: config.isOpen !== undefined ? config.isOpen : true,
        closedMessage: config.closedMessage || 'Estamos fechados no momento. Você ainda pode consultar nossos produtos e montar seu pedido!',
        announcement: config.announcement || '',
        announcementActive: config.announcementActive || false,
        schedules: config.schedules && config.schedules.length > 0 ? config.schedules : defaultSchedules,
      })
    }
  }, [config])

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

  const handleScheduleChange = (index: number, field: keyof ScheduleDay, value: any) => {
    const updated = [...(formData.schedules || defaultSchedules)]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, schedules: updated })
  }

  // Auto generate readable hours text from schedules
  const handleAutoGenerateHoursText = () => {
    const list = formData.schedules || defaultSchedules
    const parts: string[] = []

    // Grouping helper
    const activeDays = list.filter(d => !d.closed)
    if (activeDays.length === 0) {
      setFormData({ ...formData, hours: 'Fechado temporariamente' })
      return
    }

    // Check if Mon-Thu are same, Fri-Sat same, Sun distinct
    const mon = list.find(d => d.day.startsWith('Segunda'))
    const fri = list.find(d => d.day.startsWith('Sexta'))
    const sat = list.find(d => d.day.startsWith('Sábado'))
    const sun = list.find(d => d.day.startsWith('Domingo'))

    if (mon && !mon.closed) {
      parts.push(`Seg a Qui: ${mon.openTime.replace(':00', 'h')} às ${mon.closeTime.replace(':00', 'h')}`)
    }
    if (fri && !fri.closed) {
      parts.push(`Sex e Sáb: ${fri.openTime.replace(':00', 'h')} às ${fri.closeTime.replace(':00', 'h')}`)
    }
    if (sun && !sun.closed) {
      parts.push(`Dom: ${sun.openTime.replace(':00', 'h')} às ${sun.closeTime.replace(':00', 'h')}`)
    } else if (sun && sun.closed) {
      parts.push('Dom: Fechado')
    }

    const generated = parts.join(' | ')
    setFormData({ ...formData, hours: generated || 'Consulte nosso horário' })
  }

  const presetMessages = [
    'Estamos fechados no momento. Retornaremos às 18:00 com atendimento normal!',
    'Fechado para reposição de estoque. Voltamos em aproximadamente 30 minutos!',
    'Hoje não abriremos devido a feriado. Retornaremos amanhã com muitas bebidas geladas!',
    'Estamos fechados no momento. Mas você já pode ir montando seu carrinho para mais tarde!',
  ]

  const isStoreOpen = formData.isOpen !== false

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-anton text-2xl text-dark-text">Status & Horários de Atendimento</h2>
          <p className="text-sm text-dark-muted">Abra ou feche a loja, defina mensagens de aviso e configure os horários</p>
        </div>
        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium animate-fadeIn">
            ✓ Salvo com sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. STATUS PRINCIPAL DA LOJA */}
        <Card className="border border-dark-border bg-dark-card/60 overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="border-b border-dark-border/60 pb-3">
              <h3 className="text-base font-semibold text-dark-text flex items-center gap-2">
                <Power className="h-5 w-5 text-primary" />
                <span>Status da Loja (Aberto / Fechado)</span>
              </h3>
              <p className="text-xs text-dark-muted mt-0.5">Controle instantâneo para aceitar ou pausar novos pedidos no site</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Botão ABERTO */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isOpen: true })}
                className={`relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-200 ${
                  isStoreOpen
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className={`p-3 rounded-full mb-2 ${isStoreOpen ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Store className="h-6 w-6" />
                </div>
                <span className="font-anton text-base tracking-wide">🟢 LOJA ABERTA</span>
                <span className="text-xs text-emerald-400 font-semibold mt-1">
                  Recebendo pedidos normalmente
                </span>
                <span className="text-[11px] text-zinc-400 mt-1">
                  Exibe o badge "ABERTO E ENTREGANDO AGORA" no topo do catálogo.
                </span>
                {isStoreOpen && (
                  <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>

              {/* Botão FECHADO */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isOpen: false })}
                className={`relative flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-200 ${
                  !isStoreOpen
                    ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/40 text-white shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className={`p-3 rounded-full mb-2 ${!isStoreOpen ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                  <Power className="h-6 w-6" />
                </div>
                <span className="font-anton text-base tracking-wide">🔴 LOJA FECHADA</span>
                <span className="text-xs text-rose-400 font-semibold mt-1">
                  Pausada para novos pedidos
                </span>
                <span className="text-[11px] text-zinc-400 mt-1">
                  Exibe badge "FECHADO" e o banner com o horário de reabertura.
                </span>
                {!isStoreOpen && (
                  <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-rose-400 animate-pulse" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 2. MENSAGEM DE LOJA FECHADA */}
        <Card className="border border-dark-border bg-dark-card/60">
          <CardContent className="p-6 space-y-4">
            <div className="border-b border-dark-border/60 pb-3">
              <h3 className="text-base font-semibold text-dark-text flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <span>Mensagem de Aviso (Quando a Loja Estiver Fechada)</span>
              </h3>
              <p className="text-xs text-dark-muted mt-0.5">Esse texto será exibido em um banner elegante no topo do catálogo quando a loja estiver fechada</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                Texto do Aviso de Loja Fechada
              </label>
              <textarea
                rows={3}
                value={formData.closedMessage || ''}
                onChange={(e) => setFormData({ ...formData, closedMessage: e.target.value })}
                placeholder="Ex: Estamos fechados no momento. Retornaremos às 18:00 com atendimento normal!"
                className="w-full rounded-xl border border-dark-border bg-zinc-900 p-3 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
              
              {/* Sugestões rápidas de mensagens */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Sugestões rápidas:</span>
                <div className="flex flex-wrap gap-2">
                  {presetMessages.map((msg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, closedMessage: msg })}
                      className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-800 transition-colors text-left"
                    >
                      💬 {msg.slice(0, 45)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. ANÚNCIO PROMOCIONAL ESPECIAL (BANNER NO TOPO DO SITE) */}
        <Card className="border border-dark-border bg-dark-card/60">
          <CardContent className="p-6 space-y-4">
            <div className="border-b border-dark-border/60 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-dark-text flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <span>Banner de Anúncio Promocional (Topo do Site)</span>
                </h3>
                <p className="text-xs text-dark-muted mt-0.5">Destaque uma promoção, aviso de feriado ou recado especial para todos os visitantes</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcementActive || false}
                  onChange={(e) => setFormData({ ...formData, announcementActive: e.target.checked })}
                  className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800 h-4 w-4"
                />
                <span className="text-xs text-primary font-bold">Ativar Banner</span>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Texto do Anúncio
                </label>
                <Input
                  placeholder="Ex: 🔥 SUPER PROMOÇÃO: Heiniken Long Neck com 15% OFF até as 21h!"
                  value={formData.announcement || ''}
                  onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                />
              </div>

              {formData.announcementActive && formData.announcement && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/40 text-white flex items-center gap-2 shadow-lime-glow-sm animate-fadeIn">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs font-semibold">
                    <strong>Prévia:</strong> {formData.announcement}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. HORÁRIOS DE FUNCIONAMENTO (DETALHADOS & RESUMO) */}
        <Card className="border border-dark-border bg-dark-card/60">
          <CardContent className="p-6 space-y-4">
            <div className="border-b border-dark-border/60 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-dark-text flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Horários por Dia da Semana</span>
                </h3>
                <p className="text-xs text-dark-muted mt-0.5">Defina os horários de abertura e fechamento de cada dia</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoGenerateHoursText}
                className="text-xs border-primary/50 text-primary hover:bg-primary hover:text-black"
              >
                ⚡ Gerar Resumo em Texto
              </Button>
            </div>

            {/* Tabela de Dias */}
            <div className="space-y-2.5">
              {(formData.schedules || defaultSchedules).map((item, idx) => (
                <div 
                  key={item.day}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all ${
                    item.closed 
                      ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60' 
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3 w-40">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!item.closed}
                        onChange={(e) => handleScheduleChange(idx, 'closed', !e.target.checked)}
                        className="rounded border-zinc-700 text-primary focus:ring-primary bg-zinc-800 h-4 w-4"
                      />
                      <span className={`text-xs font-bold ${item.closed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {item.day}
                      </span>
                    </label>
                  </div>

                  {!item.closed ? (
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <span className="text-xs text-zinc-400">Abre:</span>
                      <Input
                        type="time"
                        value={item.openTime}
                        onChange={(e) => handleScheduleChange(idx, 'openTime', e.target.value)}
                        className="w-28 h-8 text-xs bg-zinc-950 border-zinc-700"
                      />
                      <span className="text-xs text-zinc-400 ml-2">Fecha:</span>
                      <Input
                        type="time"
                        value={item.closeTime}
                        onChange={(e) => handleScheduleChange(idx, 'closeTime', e.target.value)}
                        className="w-28 h-8 text-xs bg-zinc-950 border-zinc-700"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-rose-400 font-semibold mt-2 sm:mt-0">Fechado o dia todo</span>
                  )}
                </div>
              ))}
            </div>

            {/* Campo de Texto Resumo */}
            <div className="space-y-1.5 pt-3 border-t border-dark-border/60">
              <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                Texto de Resumo dos Horários (Exibido no Cabeçalho e Rodapé) *
              </label>
              <Input
                placeholder="Ex: Seg a Sex: 09h às 22h | Sáb e Dom: 09h às 02h"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                required
              />
              <p className="text-xs text-dark-muted">Esse texto resumido aparece nos cards informativos do catálogo e no rodapé.</p>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar Alterações */}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving} className="px-8 h-11 text-sm font-bold">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações de Status & Horários'}
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

function ProductsTab({ products, categories, onUpdate }: { products: Product[], categories: Category[], onUpdate: () => void }) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleSave = async (product: Product) => {
    const isNew = !editingProduct?.id
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Nome da Categoria *</label>
          <Input
            placeholder="Ex: Cervejas"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Ícone (Emoji) *</label>
          <Input
            placeholder="Ex: 🍺"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Descrição *</label>
        <Input
          placeholder="Ex: Cervejas nacionais e importadas bem geladas"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
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
    if (isNew && !coupon.id) {
      coupon.id = coupon.code.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Date.now()
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
        <h2 className="font-anton text-2xl text-dark-text">Cupons de Desconto</h2>
        <Button onClick={() => setEditingCoupon({ 
          id: '', 
          code: '', 
          discountType: 'percentage', 
          discountValue: 10, 
          minPurchase: 0, 
          maxUses: 100, 
          usedCount: 0, 
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          active: true 
        } as Coupon)}>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className={!coupon.active ? 'opacity-60' : ''}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg text-primary bg-primary/10 px-2.5 py-1 rounded border border-primary/30">
                  {coupon.code}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${coupon.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {coupon.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="text-sm text-dark-muted space-y-1">
                <p>
                  Desconto: <strong className="text-white">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue.toFixed(2)}`}
                  </strong>
                </p>
                {coupon.minPurchase > 0 && (
                  <p>Mínimo: <span className="text-white">R$ {coupon.minPurchase.toFixed(2)}</span></p>
                )}
                <p>Usos: <span className="text-white">{coupon.usedCount || 0} {coupon.maxUses ? `/ ${coupon.maxUses}` : ''}</span></p>
                {coupon.expiresAt && (
                  <p>Validade: <span className="text-white">{new Date(coupon.expiresAt).toLocaleDateString('pt-BR')}</span></p>
                )}
              </div>
              <div className="flex gap-2 pt-2 border-t border-dark-border">
                <Button variant="outline" size="sm" onClick={() => setEditingCoupon(coupon)}>
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(coupon.id)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
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

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Código do Cupom *</label>
          <Input
            placeholder="Ex: PRIMEIRA10"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Tipo de Desconto *</label>
          <select
            className="flex h-10 w-full rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
            required
          >
            <option value="percentage">Porcentagem (%)</option>
            <option value="fixed">Valor Fixo (R$)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
            {formData.discountType === 'percentage' ? 'Desconto (%) *' : 'Desconto (R$) *'}
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 10"
            value={formData.discountValue || ''}
            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Compra Mínima (R$)</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 50.00"
            value={formData.minPurchase || ''}
            onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Limite de Usos</label>
          <Input
            type="number"
            min="1"
            placeholder="Ex: 100"
            value={formData.maxUses || ''}
            onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || undefined })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">Data de Expiração</label>
          <Input
            type="date"
            value={formData.expiresAt ? formData.expiresAt.split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="accent-primary h-4 w-4"
            />
            <span className="text-sm text-dark-text font-medium">Cupom Ativo</span>
          </label>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-dark-border">
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
          <h2 className="font-anton text-2xl text-dark-text">Configurações Gerais da Loja</h2>
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
                  Código do país (55) + DDD + Número. Ex: <span className="text-primary font-mono">5583987654321</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-muted uppercase tracking-wider">
                  Resumo de Horário *
                </label>
                <Input
                  placeholder="Ex: Seg a Sex: 09h às 22h | Sáb e Dom: 09h às 02h"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  required
                />
                <p className="text-xs text-dark-muted">Para editar por dia da semana, use a aba "Status & Horários"</p>
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
