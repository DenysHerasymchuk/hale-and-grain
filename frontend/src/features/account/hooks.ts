import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SaveAddress } from '@/types/api'
import { accountApi } from './api'

export const accountKeys = {
  profile: ['account', 'profile'] as const,
  addresses: ['account', 'addresses'] as const,
  orders: ['account', 'orders'] as const,
  order: (orderNumber: string) => ['account', 'orders', orderNumber] as const,
}

export const useProfile = () => useQuery({ queryKey: accountKeys.profile, queryFn: ({ signal }) => accountApi.profile(signal) })
export const useAddresses = () => useQuery({ queryKey: accountKeys.addresses, queryFn: ({ signal }) => accountApi.addresses(signal) })
export const useAccountOrders = () => useQuery({ queryKey: accountKeys.orders, queryFn: ({ signal }) => accountApi.orders(signal) })
export const useAccountOrder = (orderNumber: string) =>
  useQuery({ queryKey: accountKeys.order(orderNumber), queryFn: ({ signal }) => accountApi.order(orderNumber, signal) })

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountApi.updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(accountKeys.profile, profile)
      void queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useSaveAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, address }: { id?: string; address: SaveAddress }) => (id ? accountApi.updateAddress(id, address) : accountApi.createAddress(address)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.addresses }),
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountApi.deleteAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.addresses }),
  })
}
