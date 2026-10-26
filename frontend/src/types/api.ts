// Mirrors the backend DTOs in backend/FurnitureStore.Api/Features. Keep in sync by hand;
// the surface is small enough that codegen would cost more than it saves.

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string | null
  productCount: number
}

export interface Swatch {
  name: string
  hex: string
}

export interface ProductSummary {
  id: string
  name: string
  slug: string
  shortDescription: string
  price: number
  currency: string
  categoryName: string
  categorySlug: string
  imageUrl: string | null
  imageAlt: string | null
  totalStock: number
  isFeatured: boolean
  hasModel: boolean
  swatches: Swatch[]
}

export type ImageRole = 'primary' | 'gallery' | 'detail' | 'lifestyle'

export interface ProductImage {
  url: string
  altText: string
  role: ImageRole
}

export interface ProductVariant {
  id: string
  sku: string
  name: string
  material: string | null
  size: string | null
  swatchHex: string
  price: number
  stock: number
  modelTint: string | null
}

export interface ModelConfig {
  scale: number
  rotation: number[]
  offset: number[]
  cameraPosition: number[] | null
  materialTargets: string[]
}

export interface ProductModel {
  url: string
  format: 'glb' | 'gltf'
  fileSizeBytes: number | null
  attribution: string | null
  attributionUrl: string | null
  license: string | null
  config: ModelConfig
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  sku: string
  shortDescription: string
  description: string
  price: number
  currency: string
  brand: string | null
  dimensions: string | null
  materials: string | null
  categoryName: string
  categorySlug: string
  totalStock: number
  images: ProductImage[]
  variants: ProductVariant[]
  model: ProductModel | null
}

export type ProductSort = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name'

export interface ProductQuery {
  page?: number
  pageSize?: number
  q?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
  sort?: ProductSort
}

/** RFC 7807 body returned by every API error. */
export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  errors?: Record<string, string[]>
}

export interface CartLineRequest {
  variantId: string
  quantity: number
}

export interface QuoteLine {
  variantId: string
  productId: string
  productName: string
  productSlug: string
  variantName: string
  sku: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
  available: number
}

export interface LineProblem {
  variantId: string
  code: 'unavailable' | 'insufficient_stock' | 'quantity_limit'
  message: string
  available: number
}

export interface Quote {
  lines: QuoteLine[]
  problems: LineProblem[]
  currency: string
  subtotal: number
  shippingCost: number
  total: number
  canCheckout: boolean
}

export interface ShippingAddress {
  line1: string
  line2: string | null
  city: string
  postalCode: string
  country: string
}

export interface CheckoutDetails {
  email: string
  fullName: string
  phone: string | null
  shippingAddress: ShippingAddress
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'developmentSimulated' | 'paid' | 'failed' | 'refunded'

export interface OrderLine {
  productId: string | null
  productName: string
  productSlug: string
  variantName: string
  sku: string
  imageUrl: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Order {
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentReference: string | null
  email: string
  fullName: string
  phone: string | null
  shippingAddress: ShippingAddress
  lines: OrderLine[]
  currency: string
  subtotal: number
  shippingCost: number
  total: number
  createdAt: string
}

export interface CreateOrderResponse {
  order: Order
  accessToken: string
}

export interface Profile {
  email: string
  firstName: string
  lastName: string
  marketingEmails: boolean
  createdAt: string
}

export interface Address {
  id: string
  label: string
  fullName: string
  line1: string
  line2: string | null
  city: string
  postalCode: string
  country: string
  isDefault: boolean
}

export type SaveAddress = Omit<Address, 'id'>

export interface OrderSummary {
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  itemCount: number
  total: number
  currency: string
  createdAt: string
}

export interface WishlistItem {
  productId: string
  slug: string
  name: string
  categoryName: string
  imageUrl: string | null
  price: number
  currency: string
}
