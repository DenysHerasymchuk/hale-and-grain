import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface OrderAccessState {
  tokens: Record<string, string>
  remember: (orderNumber: string, token: string) => void
}

export const useOrderAccessStore = create<OrderAccessState>()(
  persist(
    (set) => ({
      tokens: {},
      remember: (orderNumber, token) => set((state) => ({ tokens: { ...state.tokens, [orderNumber]: token } })),
    }),
    { name: 'hale-grain-orders', storage: createJSONStorage(() => localStorage) },
  ),
)
