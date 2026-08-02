'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        router.push('/admin/dashboard')
      } else {
        setError('Senha inválida')
      }
    } catch (error) {
      setError('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-bg px-4 selection:bg-primary selection:text-black">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center -z-10">
        <div className="w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center space-y-3">
          <div className="relative inline-block">
            <div className="absolute -inset-1 rounded-full bg-primary/40 blur-md" />
            <img 
              src="/logo.png" 
              alt="Galego Depósito de Bebidas" 
              className="relative h-24 w-24 rounded-full object-cover ring-2 ring-primary shadow-lime-glow mx-auto"
            />
          </div>
          <div>
            <h1 className="font-anton text-3xl tracking-wider text-white">GALEGO</h1>
            <p className="font-manrope text-xs font-bold tracking-widest text-primary uppercase">
              - Depósito de Bebidas -
            </p>
            <p className="text-xs text-dark-muted mt-1">Painel Administrativo</p>
          </div>
        </div>

        <div className="rounded-2xl border border-dark-border bg-dark-card p-6 shadow-xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-dark-muted">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-muted" />
                <Input
                  type="password"
                  placeholder="Digite sua senha de admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-zinc-900 border-zinc-800 focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center font-medium">
                ⚠️ {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-bold" disabled={loading}>
              {loading ? 'Entrando...' : 'Acessar Painel'}
            </Button>
          </form>

          <p className="pt-2 text-center text-xs text-dark-muted border-t border-zinc-900">
            <a href="/" className="text-primary hover:underline font-semibold">
              ← Voltar ao catálogo da loja
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
