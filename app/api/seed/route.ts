import { NextResponse } from 'next/server'
import { 
  createProduct, 
  createCategory, 
  createCoupon, 
  updateConfig 
} from '@/lib/db'
import { Product, Category, Coupon, Config } from '@/types'

const sampleCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Cervejas',
    description: 'Cervejas nacionais e importadas',
    icon: '🍺',
    order: 1,
  },
  {
    id: 'cat-2',
    name: 'Refrigerantes',
    description: 'Refrigerantes variados',
    icon: '🥤',
    order: 2,
  },
  {
    id: 'cat-3',
    name: 'Destilados',
    description: 'Vodcas, whiskies e outros destilados',
    icon: '🥃',
    order: 3,
  },
  {
    id: 'cat-4',
    name: 'Vinhos',
    description: 'Vinhos tintos, brancos e espumantes',
    icon: '🍷',
    order: 4,
  },
  {
    id: 'cat-5',
    name: 'Não Alcoólicos',
    description: 'Sucos, águas e energéticos',
    icon: '🧃',
    order: 5,
  },
]

const sampleProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Cerveja Brahma 350ml',
    description: 'Cerveja lager brasileira, refrescante e leve',
    price: 3.50,
    category: 'cat-1',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=400&fit=crop',
    available: true,
    featured: true,
    bestseller: true,
  },
  {
    id: 'prod-2',
    name: 'Cerveja Skol 350ml',
    description: 'Cerveja pilsen com sabor suave',
    price: 3.50,
    category: 'cat-1',
    image: 'https://images.unsplash.com/photo-1575424909138-46b05e5919ec?w=400&h=400&fit=crop',
    available: true,
    featured: true,
    bestseller: true,
  },
  {
    id: 'prod-3',
    name: 'Cerveja Antarctica 350ml',
    description: 'Cerveja tradicional brasileira',
    price: 3.50,
    category: 'cat-1',
    image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=400&h=400&fit=crop',
    available: true,
    featured: false,
    bestseller: false,
  },
  {
    id: 'prod-4',
    name: 'Heineken 330ml',
    description: 'Cerveja premium holandesa',
    price: 6.50,
    category: 'cat-1',
    image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=400&h=400&fit=crop',
    available: true,
    featured: true,
    bestseller: false,
  },
  {
    id: 'prod-5',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante de cola tradicional',
    price: 8.90,
    category: 'cat-2',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&h=400&fit=crop',
    available: true,
    featured: true,
    bestseller: true,
  },
  {
    id: 'prod-6',
    name: 'Guaraná Antarctica 2L',
    description: 'Refrigerante de guaraná brasileiro',
    price: 7.90,
    category: 'cat-2',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=400&fit=crop',
    available: true,
    featured: false,
    bestseller: true,
  },
  {
    id: 'prod-7',
    name: 'Smirnoff Vodka 1L',
    description: 'Vodka premium russa',
    price: 45.90,
    category: 'cat-3',
    image: 'https://images.unsplash.com/photo-1607622750640-6a2b48c8b09f?w=400&h=400&fit=crop',
    available: true,
    featured: true,
    bestseller: false,
  },
  {
    id: 'prod-8',
    name: 'Whisky Red Label 750ml',
    description: 'Whisky escocês blended',
    price: 89.90,
    category: 'cat-3',
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop',
    available: true,
    featured: true,
    bestseller: true,
  },
  {
    id: 'prod-9',
    name: 'Vinho Chileno Cabernet 750ml',
    description: 'Vinho tinto chileno seco',
    price: 35.90,
    category: 'cat-4',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=400&fit=crop',
    available: true,
    featured: false,
    bestseller: false,
  },
  {
    id: 'prod-10',
    name: 'Suco de Laranja 1L',
    description: 'Suco natural de laranja',
    price: 12.90,
    category: 'cat-5',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop',
    available: true,
    featured: false,
    bestseller: false,
  },
]

const sampleCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'PRIMEIRA10',
    discountType: 'percentage',
    discountValue: 10,
    minPurchase: 50,
    maxUses: 100,
    usedCount: 0,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: 'coupon-2',
    code: 'FRETEGRATIS',
    discountType: 'fixed',
    discountValue: 5,
    minPurchase: 80,
    maxUses: 50,
    usedCount: 0,
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
]

const sampleConfig: Config = {
  storeName: 'Galego — Depósito de Bebidas',
  whatsapp: '5511999999999',
  address: 'Rua das Bebidas, 123 - Centro',
  hours: 'Seg-Sex: 9h-20h | Sáb: 9h-18h',
  deliveryFee: 5.00,
  minOrderValue: 30.00,
  deliveryRadius: 5,
}

export async function POST() {
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await getRedis().flushall()

    // Seed categories
    for (const category of sampleCategories) {
      await createCategory(category)
    }

    // Seed products
    for (const product of sampleProducts) {
      await createProduct(product)
    }

    // Seed coupons
    for (const coupon of sampleCoupons) {
      await createCoupon(coupon)
    }

    // Seed config
    await updateConfig(sampleConfig)

    return NextResponse.json({ 
      success: true,
      message: 'Database seeded successfully',
      counts: {
        categories: sampleCategories.length,
        products: sampleProducts.length,
        coupons: sampleCoupons.length,
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
