import type { OrderStatus, PaymentStatus } from '@/types/api'

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Received',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const paymentLabels: Record<PaymentStatus, string> = {
  pending: 'Awaiting payment',
  developmentSimulated: 'Development checkout, no payment taken',
  paid: 'Paid',
  failed: 'Payment failed',
  refunded: 'Refunded',
}

export const orderStatusLabel = (status: OrderStatus) => statusLabels[status]
export const paymentStatusLabel = (status: PaymentStatus) => paymentLabels[status]

export const orderStatuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
