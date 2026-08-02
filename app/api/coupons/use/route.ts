import { NextRequest, NextResponse } from 'next/server'
import { getCouponByCode, getCoupon, incrementCouponUsage } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, id } = body

    if (!code && !id) {
      return NextResponse.json({ error: 'Código ou ID do cupom é obrigatório' }, { status: 400 })
    }

    let coupon = null
    if (id) {
      coupon = await getCoupon(id)
    } else if (code) {
      coupon = await getCouponByCode(code)
    }

    if (!coupon) {
      return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 })
    }

    await incrementCouponUsage(coupon.id)

    return NextResponse.json({ 
      success: true, 
      couponId: coupon.id,
      usedCount: (coupon.usedCount || 0) + 1 
    })
  } catch (error) {
    console.error('Error recording coupon usage:', error)
    return NextResponse.json({ error: 'Falha ao registrar uso do cupom' }, { status: 500 })
  }
}
