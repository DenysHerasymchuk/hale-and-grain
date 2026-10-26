import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWishlistStore } from '@/features/wishlist/wishlistStore'
import { ApiError } from '@/lib/apiClient'
import { authApi, type Credentials, type Session } from './api'

export const sessionKey = ['session'] as const

/** The signed-in customer, or null for guests. A 401 is an answer, not an error. */
export function useSession() {
  return useQuery<Session | null>({
    queryKey: sessionKey,
    queryFn: async ({ signal }) => {
      try {
        return await authApi.me(signal)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: Credentials) => authApi.login(credentials),
    // Remove rather than invalidate: no observer may be mounted on the auth pages, and a stale
    // cached `null` would make the next protected route bounce straight back to login.
    onSuccess: () => queryClient.removeQueries({ queryKey: sessionKey }),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    // Account data must not linger after sign-out, on screen or on this device.
    onSettled: () => {
      queryClient.clear()
      useWishlistStore.getState().replaceAll([])
    },
  })
}
