import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface WishlistEntry {
  productId: string
  slug: string
  name: string
  categoryName: string
  imageUrl: string | null
  price: number
  currency: string
}

interface WishlistState {
  items: WishlistEntry[]
  toggle: (entry: WishlistEntry) => void
  remove: (productId: string) => void
  replaceAll: (items: WishlistEntry[]) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (entry) =>
        set((state) =>
          state.items.some((item) => item.productId === entry.productId)
            ? { items: state.items.filter((item) => item.productId !== entry.productId) }
            : { items: [entry, ...state.items] },
        ),
      remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      replaceAll: (items) => set({ items }),
    }),
    { name: 'hale-grain-wishlist', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
)
