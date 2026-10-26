import { useSearchParams } from 'react-router'
import { useOrderAccessStore } from '@/features/checkout/orderAccessStore'

/** Token from the link (?token=) wins; otherwise one remembered on this device at checkout. */
export function useOrderAccessToken(orderNumber: string): string | null {
  const [searchParams] = useSearchParams()
  const remembered = useOrderAccessStore((state) => state.tokens[orderNumber])
  return searchParams.get('token') ?? remembered ?? null
}
