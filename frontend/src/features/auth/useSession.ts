import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionKey }),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    // Drop every cached query: account data must not linger after sign-out.
    onSettled: () => {
      queryClient.clear()
    },
  })
}
