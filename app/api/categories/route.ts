import { NextRequest, NextResponse } from 'next/server'
import { getCategories, createCategory } from '@/lib/db'
import { Category } from '@/types'
import { verifyAdminSession } from '@/lib/auth'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession(request)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const category: Category = await request.json()
    
    if (!category.id || !category.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await createCategory(category)
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
