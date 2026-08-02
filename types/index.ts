export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
  featured: boolean
  bestseller: boolean
  promotional?: boolean
  promotionalPrice?: number
  stock?: number
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  order: number
}

export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minPurchase: number
  maxUses?: number
  usedCount: number
  expiresAt: string
  active: boolean
}

export interface Config {
  storeName: string
  whatsapp: string
  address: string
  hours: string
  deliveryFee: number
  minOrderValue: number
  deliveryRadius: number
  adminPasswordHash?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CustomerInfo {
  name: string
  phone: string
  cep?: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city?: string
  reference?: string
  address?: string
}

export interface Order {
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  couponCode?: string
  total: number
  customer: CustomerInfo
  paymentMethod: string
  changeFor?: string
  notes?: string
}
