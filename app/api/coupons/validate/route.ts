import { NextRequest, NextResponse } from 'next/server'
import { getCouponByCode, incrementCouponUsage } from '@/lib/db'
import { isPast } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()

    if (!code || subtotal === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const coupon = await getCouponByCode(code)

    if (!coupon) {
      return NextResponse.json({ error: 'Cupom inválido' }, { status: 400 })
    }

    if (!coupon.active) {
      return NextResponse.json({ error: 'Cupom inativo' }, { status: 400 })
    }

    if (isPast(new Date(coupon.expiresAt))) {
      return NextResponse.json({ error: 'Cupom expirado' }, { status: 400 })
    }

    if (subtotal < coupon.minPurchase) {
      return NextResponse.json({ 
        error: `Valor mínimo de compra: R$ ${coupon.minPurchase.toFixed(2)}` 
      }, { status: 400 })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'Cupom esgotado' }, { status: 400 })
    }

    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = subtotal * (coupon.discountValue / 100)
    } else {
      discount = coupon.discountValue
    }

    await incrementCouponUsage(coupon.id)

    return NextResponse.json({
      valid: true,
      discount,
      couponCode: coupon.code,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
