import { create } from 'zustand'

export interface CartNotice {
  id: number
  name: string
  variantName: string
  imageUrl: string | null
  quantity: number
}

interface CartNoticeState {
  notice: CartNotice | null
  show: (notice: Omit<CartNotice, 'id'>) => void
  dismiss: () => void
}

export const useCartNotice = create<CartNoticeState>()((set) => ({
  notice: null,
  show: (notice) => set({ notice: { ...notice, id: Date.now() } }),
  dismiss: () => set({ notice: null }),
}))
