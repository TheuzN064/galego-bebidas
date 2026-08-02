import { NextRequest, NextResponse } from 'next/server'
import { getCoupons, createCoupon } from '@/lib/db'
import { Coupon } from '@/types'
import { verifyAdminSession } from '@/lib/auth'

export async function GET() {
  try {
    const coupons = await getCoupons()
    return NextResponse.json(coupons)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    if (!body.code || !body.discountType || body.discountValue === undefined || body.discountValue <= 0) {
      return NextResponse.json({ error: 'Código e valor de desconto são obrigatórios' }, { status: 400 })
    }

    const cleanCode = String(body.code).trim().toUpperCase()
    const id = body.id || cleanCode.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `coupon-${Date.now()}`

    const coupon: Coupon = {
      id,
      code: cleanCode,
      discountType: body.discountType,
      discountValue: Number(body.discountValue),
      minPurchase: Number(body.minPurchase) || 0,
      maxUses: body.maxUses ? Number(body.maxUses) : undefined,
      usedCount: Number(body.usedCount) || 0,
      expiresAt: body.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      active: body.active !== false,
    }

    await createCoupon(coupon)
    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}
