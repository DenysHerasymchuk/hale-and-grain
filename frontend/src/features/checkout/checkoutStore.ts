import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CheckoutDetails } from '@/types/api'

interface CheckoutState {
  details: CheckoutDetails | null
  setDetails: (details: CheckoutDetails) => void
  clear: () => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      details: null,
      setDetails: (details) => set({ details }),
      clear: () => set({ details: null }),
    }),
    { name: 'hale-grain-checkout', storage: createJSONStorage(() => sessionStorage) },
  ),
)
