import { MAX_LINE_QUANTITY, selectItemCount, selectSubtotal, useCartStore, type CartLine } from './cartStore'

const chair: Omit<CartLine, 'quantity'> = {
  productId: 'p1',
  variantId: 'v1',
  slug: 'harrow-dining-table',
  name: 'Harrow Dining Table',
  variantName: 'Natural',
  sku: 'HG-TBL-HARROW-NAT',
  imageUrl: null,
  unitPrice: 1890.1,
  currency: 'EUR',
  available: 6,
}

beforeEach(() => {
  localStorage.clear()
  useCartStore.setState({ lines: [] })
})

describe('cart store', () => {
  it('adds a line and merges repeat adds of the same variant', () => {
    useCartStore.getState().add(chair, 1)
    useCartStore.getState().add(chair, 2)
    const { lines } = useCartStore.getState()
    expect(lines).toHaveLength(1)
    expect(lines[0]?.quantity).toBe(3)
  })

  it('never exceeds the stock seen or the per-line limit', () => {
    useCartStore.getState().add(chair, 50)
    expect(useCartStore.getState().lines[0]?.quantity).toBe(6)
    useCartStore.getState().add({ ...chair, variantId: 'v2', available: 99 }, 50)
    expect(useCartStore.getState().lines[1]?.quantity).toBe(MAX_LINE_QUANTITY)
  })

  it('updates quantities with a floor of one, and removes lines', () => {
    useCartStore.getState().add(chair, 2)
    useCartStore.getState().setQuantity('v1', 0)
    expect(useCartStore.getState().lines[0]?.quantity).toBe(1)
    useCartStore.getState().remove('v1')
    expect(useCartStore.getState().lines).toEqual([])
  })

  it('totals without floating point drift', () => {
    useCartStore.getState().add(chair, 3)
    expect(selectItemCount(useCartStore.getState())).toBe(3)
    expect(selectSubtotal(useCartStore.getState())).toBe(5670.3)
  })

  it('persists to localStorage and restores on rehydrate', async () => {
    useCartStore.getState().add(chair, 2)
    const saved = localStorage.getItem('hale-grain-cart')
    expect(saved).toContain('HG-TBL-HARROW-NAT')

    useCartStore.setState({ lines: [] })
    localStorage.setItem('hale-grain-cart', saved ?? '')
    await useCartStore.persist.rehydrate()
    expect(useCartStore.getState().lines[0]?.quantity).toBe(2)
  })
})
