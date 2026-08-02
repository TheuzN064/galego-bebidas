import { getRedis } from './redis'
import { Product, Category, Coupon, Config, ScheduleDay } from '@/types'

// Redis key patterns
const KEYS = {
  products: 'products',
  product: (id: string) => `products:${id}`,
  productsIndex: 'products:index',
  categories: 'categories',
  category: (id: string) => `categories:${id}`,
  categoriesIndex: 'categories:index',
  coupons: 'coupons',
  coupon: (id: string) => `coupons:${id}`,
  couponsIndex: 'coupons:index',
  config: 'config',
}

// Products
export async function getProducts(): Promise<Product[]> {
  const redis = getRedis()
  const productIds = await redis.smembers(KEYS.productsIndex)
  
  if (productIds.length === 0) return []
  
  const products = await Promise.all(
    productIds.map(id => redis.get<Product>(KEYS.product(id)))
  )
  
  return products.filter((p): p is Product => p !== null)
}

export async function getProduct(id: string): Promise<Product | null> {
  const redis = getRedis()
  return await redis.get<Product>(KEYS.product(id))
}

export async function createProduct(product: Product): Promise<void> {
  const redis = getRedis()
  await redis.set(KEYS.product(product.id), product)
  await redis.sadd(KEYS.productsIndex, product.id)
}

export async function updateProduct(product: Product): Promise<void> {
  const redis = getRedis()
  await redis.set(KEYS.product(product.id), product)
}

export async function deleteProduct(id: string): Promise<void> {
  const redis = getRedis()
  await redis.del(KEYS.product(id))
  await redis.srem(KEYS.productsIndex, id)
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const redis = getRedis()
  const categoryIds = await redis.smembers(KEYS.categoriesIndex)
  
  if (categoryIds.length === 0) return []
  
  const categories = await Promise.all(
    categoryIds.map(id => redis.get<Category>(KEYS.category(id)))
  )
  
  return categories.filter((c): c is Category => c !== null).sort((a, b) => a.order - b.order)
}

export async function getCategory(id: string): Promise<Category | null> {
  const redis = getRedis()
  return await redis.get<Category>(KEYS.category(id))
}

export async function createCategory(category: Category): Promise<void> {
  const redis = getRedis()
  await redis.set(KEYS.category(category.id), category)
  await redis.sadd(KEYS.categoriesIndex, category.id)
}

export async function updateCategory(category: Category): Promise<void> {
  const redis = getRedis()
  await redis.set(KEYS.category(category.id), category)
}

export async function deleteCategory(id: string): Promise<void> {
  const redis = getRedis()
  await redis.del(KEYS.category(id))
  await redis.srem(KEYS.categoriesIndex, id)
}

// Coupons
export async function getCoupons(): Promise<Coupon[]> {
  const redis = getRedis()
  const couponIds = await redis.smembers(KEYS.couponsIndex)
  
  if (couponIds.length === 0) return []
  
  const coupons = await Promise.all(
    couponIds.map(id => redis.get<Coupon>(KEYS.coupon(id)))
  )
  
  return coupons.filter((c): c is Coupon => c !== null)
}

export async function getCoupon(id: string): Promise<Coupon | null> {
  const redis = getRedis()
  return await redis.get<Coupon>(KEYS.coupon(id))
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const coupons = await getCoupons()
  return coupons.find(c => c.code.toLowerCase() === code.toLowerCase()) || null
}

export async function createCoupon(coupon: Coupon): Promise<void> {
  const redis = getRedis()
  await redis.set(KEYS.coupon(coupon.id), coupon)
  await redis.sadd(KEYS.couponsIndex, coupon.id)
}

export async function updateCoupon(coupon: Coupon): Promise<void> {
  const redis = getRedis()
  await redis.set(KEYS.coupon(coupon.id), coupon)
}

export async function deleteCoupon(id: string): Promise<void> {
  const redis = getRedis()
  await redis.del(KEYS.coupon(id))
  await redis.srem(KEYS.couponsIndex, id)
}

export async function incrementCouponUsage(id: string): Promise<void> {
  const coupon = await getCoupon(id)
  if (coupon) {
    coupon.usedCount += 1
    await updateCoupon(coupon)
  }
}

// Config
export async function getConfig(): Promise<Config> {
  const redis = getRedis()
  const config = await redis.get<Config>(KEYS.config)
  
  const defaultSchedules: ScheduleDay[] = [
    { day: 'Segunda-feira', openTime: '09:00', closeTime: '22:00', closed: false },
    { day: 'Terça-feira', openTime: '09:00', closeTime: '22:00', closed: false },
    { day: 'Quarta-feira', openTime: '09:00', closeTime: '22:00', closed: false },
    { day: 'Quinta-feira', openTime: '09:00', closeTime: '23:00', closed: false },
    { day: 'Sexta-feira', openTime: '09:00', closeTime: '02:00', closed: false },
    { day: 'Sábado', openTime: '09:00', closeTime: '02:00', closed: false },
    { day: 'Domingo', openTime: '09:00', closeTime: '20:00', closed: false },
  ]

  if (!config) {
    return {
      storeName: 'Galego — Depósito de Bebidas',
      whatsapp: '',
      address: '',
      hours: 'Seg a Sex: 09h às 22h | Sáb e Dom: 09h às 02h',
      deliveryFee: 0,
      minOrderValue: 0,
      deliveryRadius: 0,
      isOpen: true,
      closedMessage: 'Estamos fechados no momento. Você ainda pode consultar nossos produtos e montar seu pedido!',
      announcement: '',
      announcementActive: false,
      schedules: defaultSchedules,
    }
  }

  // Ensure defaults for existing records
  return {
    ...config,
    isOpen: config.isOpen !== undefined ? config.isOpen : true,
    closedMessage: config.closedMessage || 'Estamos fechados no momento. Você ainda pode consultar nossos produtos e montar seu pedido!',
    announcement: config.announcement || '',
    announcementActive: config.announcementActive || false,
    schedules: config.schedules && config.schedules.length > 0 ? config.schedules : defaultSchedules,
  }
}

export async function updateConfig(config: Config): Promise<void> {
  const redis = getRedis()
  await redis.set(KEYS.config, config)
}
