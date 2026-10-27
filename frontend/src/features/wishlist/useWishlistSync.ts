import { useEffect } from 'react'
import { accountApi } from '@/features/account/api'
import { useSession } from '@/features/auth/useSession'
import { useWishlistStore } from './wishlistStore'

export function useWishlistSync() {
  const { data: session } = useSession()
  const userId = session?.id ?? null

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    let unsubscribe: (() => void) | undefined
    const local = useWishlistStore.getState().items

    void accountApi
      .wishlist()
      .then((remote) => accountApi.replaceWishlist([...new Set([...local, ...remote].map((item) => item.productId))]))
      .then((merged) => {
        if (cancelled) return
        useWishlistStore.getState().replaceAll(merged)
        unsubscribe = useWishlistStore.subscribe((state, previous) => {
          if (state.items === previous.items) return
          void accountApi.replaceWishlist(state.items.map((item) => item.productId)).catch((error: unknown) => console.warn('Wishlist save failed', error))
        })
      })
      .catch((error: unknown) => console.warn('Wishlist sync failed; keeping the local copy', error))

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [userId])
}
