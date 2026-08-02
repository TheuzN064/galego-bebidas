import { NextRequest, NextResponse } from 'next/server'
import { getCouponByCode } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()

    if (!code || subtotal === undefined) {
      return NextResponse.json({ error: 'Código do cupom e subtotal são obrigatórios' }, { status: 400 })
    }

    const cleanCode = String(code).trim().toUpperCase()
    const coupon = await getCouponByCode(cleanCode)

    if (!coupon) {
      return NextResponse.json({ error: 'Cupom inválido ou não encontrado' }, { status: 400 })
    }

    if (!coupon.active) {
      return NextResponse.json({ error: 'Este cupom está inativo no momento' }, { status: 400 })
    }

    if (coupon.expiresAt) {
      // Ensure expiration date includes end-of-day time if only date is provided
      const expiresDate = new Date(coupon.expiresAt.includes('T') ? coupon.expiresAt : `${coupon.expiresAt}T23:59:59.999Z`)
      const now = new Date()
      if (expiresDate.getTime() < now.getTime()) {
        return NextResponse.json({ error: 'Este cupom já expirou' }, { status: 400 })
      }
    }

    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return NextResponse.json({ 
        error: `Valor mínimo de compra para este cupom: R$ ${coupon.minPurchase.toFixed(2).replace('.', ',')}` 
      }, { status: 400 })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Este cupom atingiu o limite máximo de utilizações' }, { status: 400 })
    }

    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100
    } else {
      discount = Math.min(coupon.discountValue, subtotal)
    }

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount * 100) / 100,
      couponCode: coupon.code,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 })
  }
}
