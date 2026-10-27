import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useWishlistStore } from '@/features/wishlist/wishlistStore'
import { ApiError } from '@/lib/apiClient'
import { authApi, type Credentials, type Session } from './api'

export const sessionKey = ['session'] as const

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
    onSuccess: () => queryClient.removeQueries({ queryKey: sessionKey }),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.clear()
      useWishlistStore.getState().replaceAll([])
    },
  })
}
