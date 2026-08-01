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

    const coupon: Coupon = await request.json()
    
    if (!coupon.id || !coupon.code || !coupon.discountType || !coupon.discountValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await createCoupon(coupon)
    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}
