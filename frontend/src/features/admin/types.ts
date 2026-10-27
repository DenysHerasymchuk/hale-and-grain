// Mirrors backend/FurnitureStore.Api/Features/Admin/AdminDtos.cs.
import type { ImageRole, OrderStatus, PaymentStatus } from '@/types/api'

export interface AdminImage {
  url: string
  altText: string
  role: ImageRole
}

export interface AdminVariant {
  id: string | null
  sku: string
  name: string
  material: string | null
  size: string | null
  swatchHex: string
  priceAdjustment: number
  stock: number
  modelTint: string | null
}

export interface AdminModelConfig {
  scale: number
  rotation: number[]
  offset: number[]
  cameraPosition: number[] | null
  materialTargets: string[]
}

export interface AdminModel {
  url: string
  format: 'glb' | 'gltf'
  fileSizeBytes: number | null
  attribution: string | null
  attributionUrl: string | null
  license: string | null
  config: AdminModelConfig
}

export interface AdminProductInput {
  name: string
  slug: string
  sku: string
  shortDescription: string
  description: string
  price: number
  categoryId: string
  brand: string | null
  dimensions: string | null
  materials: string | null
  isPublished: boolean
  isFeatured: boolean
  images: AdminImage[]
  variants: AdminVariant[]
  model: AdminModel | null
}

export interface AdminProduct extends AdminProductInput {
  id: string
  currency: string
  createdAt: string
  updatedAt: string
}

export interface AdminProductListItem {
  id: string
  name: string
  slug: string
  sku: string
  categoryName: string
  price: number
  totalStock: number
  variantCount: number
  isPublished: boolean
  isFeatured: boolean
  hasModel: boolean
  imageUrl: string | null
  updatedAt: string
}

export interface AdminCategory {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string | null
  displayOrder: number
  productCount: number
}

export type AdminCategoryInput = Omit<AdminCategory, 'id' | 'productCount'>

export interface InventoryItem {
  variantId: string
  productId: string
  productName: string
  variantName: string
  sku: string
  stock: number
  isPublished: boolean
}

export interface AdminOrderListItem {
  id: string
  orderNumber: string
  fullName: string
  email: string
  itemCount: number
  total: number
  currency: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdAt: string
}

export interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  emailConfirmed: boolean
  orderCount: number
  totalSpent: number
  createdAt: string
}

export interface StoreSettings {
  storeName: string
  supportEmail: string
  flatShippingCost: number
  freeShippingThreshold: number
  lowStockThreshold: number
}

export interface Dashboard {
  ordersToday: number
  ordersLast30Days: number
  revenueLast30Days: number
  currency: string
  lowStockVariants: number
  outOfStockVariants: number
  publishedProducts: number
  customers: number
  recentOrders: AdminOrderListItem[]
}
