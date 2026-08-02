import { NextRequest, NextResponse } from 'next/server'
import { getCoupon, updateCoupon, deleteCoupon } from '@/lib/db'
import { Coupon } from '@/types'
import { verifyAdminSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = await getCoupon(params.id)
    
    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await verifyAdminSession(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const cleanCode = String(body.code).trim().toUpperCase()

    const coupon: Coupon = {
      id: params.id,
      code: cleanCode,
      discountType: body.discountType,
      discountValue: Number(body.discountValue),
      minPurchase: Number(body.minPurchase) || 0,
      maxUses: body.maxUses ? Number(body.maxUses) : undefined,
      usedCount: Number(body.usedCount) || 0,
      expiresAt: body.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      active: body.active !== false,
    }

    await updateCoupon(coupon)
    return NextResponse.json(coupon)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await verifyAdminSession(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteCoupon(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
}
