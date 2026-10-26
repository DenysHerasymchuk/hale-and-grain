import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface OrderAccessState {
  tokens: Record<string, string>
  remember: (orderNumber: string, token: string) => void
}

/** Guest order access tokens, so a customer on this device can reopen their orders. */
export const useOrderAccessStore = create<OrderAccessState>()(
  persist(
    (set) => ({
      tokens: {},
      remember: (orderNumber, token) => set((state) => ({ tokens: { ...state.tokens, [orderNumber]: token } })),
    }),
    { name: 'hale-grain-orders', storage: createJSONStorage(() => localStorage) },
  ),
)
