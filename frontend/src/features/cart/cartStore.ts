import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const MAX_LINE_QUANTITY = 10

export interface CartLine {
  productId: string
  variantId: string
  slug: string
  name: string
  variantName: string
  sku: string
  imageUrl: string | null
  unitPrice: number
  currency: string
  available: number
  quantity: number
}

interface CartState {
  lines: CartLine[]
  add: (line: Omit<CartLine, 'quantity'>, quantity: number) => void
  setQuantity: (variantId: string, quantity: number) => void
  remove: (variantId: string) => void
  clear: () => void
  syncPrices: (updates: { variantId: string; unitPrice: number; available: number }[]) => void
}

export const lineLimit = (line: Pick<CartLine, 'available'>) => Math.max(0, Math.min(MAX_LINE_QUANTITY, line.available))

const clampQuantity = (quantity: number, line: Pick<CartLine, 'available'>) => Math.max(1, Math.min(lineLimit(line), Math.floor(quantity)))

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line, quantity) =>
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === line.variantId)
          if (!existing) {
            return { lines: [...state.lines, { ...line, quantity: clampQuantity(quantity, line) }] }
          }
          return {
            lines: state.lines.map((l) => (l.variantId === line.variantId ? { ...line, quantity: clampQuantity(l.quantity + quantity, line) } : l)),
          }
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.variantId === variantId ? { ...l, quantity: clampQuantity(quantity, l) } : l)),
        })),
      remove: (variantId) => set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
      syncPrices: (updates) =>
        set((state) => {
          let changed = false
          const lines = state.lines.map((line) => {
            const update = updates.find((u) => u.variantId === line.variantId)
            if (!update || (update.unitPrice === line.unitPrice && update.available === line.available)) return line
            changed = true
            return { ...line, unitPrice: update.unitPrice, available: update.available }
          })
          return changed ? { lines } : state
        }),
    }),
    {
      name: 'hale-grain-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
)

export const selectItemCount = (state: CartState) => state.lines.reduce((sum, line) => sum + line.quantity, 0)

export const selectSubtotal = (state: CartState) => state.lines.reduce((sum, line) => sum + Math.round(line.unitPrice * 100) * line.quantity, 0) / 100
