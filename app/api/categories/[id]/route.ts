import { NextRequest, NextResponse } from 'next/server'
import { getCategory, updateCategory, deleteCategory, getProducts, updateProduct, getCategories } from '@/lib/db'
import { Category } from '@/types'
import { verifyAdminSession } from '@/lib/auth'


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await getCategory(params.id)
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
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

    const category: Category = await request.json()
    category.id = params.id

    await updateCategory(category)
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
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

    // Check if any products are linked to this category
    const [allProducts, allCategories] = await Promise.all([
      getProducts(),
      getCategories(),
    ])

    const remainingCategories = allCategories.filter(c => c.id !== params.id)
    const fallbackCategory = remainingCategories.length > 0 ? remainingCategories[0].id : ''

    const productsToUpdate = allProducts.filter(p => p.category === params.id)
    if (productsToUpdate.length > 0 && fallbackCategory) {
      await Promise.all(
        productsToUpdate.map(p => updateProduct({ ...p, category: fallbackCategory }))
      )
    }

    await deleteCategory(params.id)
    return NextResponse.json({ success: true, reassignedProductsCount: productsToUpdate.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}

