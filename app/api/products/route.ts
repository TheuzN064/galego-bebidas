import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct } from '@/lib/db'
import { Product } from '@/types'
import { verifyAdminSession } from '@/lib/auth'

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product: Product = await request.json()
    
    if (!product.id || !product.name || !product.price || !product.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await createProduct(product)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
