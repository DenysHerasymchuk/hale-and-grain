import type { CheckoutDetails } from '@/types/api'
import { validateDetails } from './validateDetails'

const valid: CheckoutDetails = {
  email: 'ada@example.com',
  fullName: 'Ada Lovelace',
  phone: '+32 470 12 34 56',
  shippingAddress: { line1: 'Grote Markt 1', line2: null, city: 'Antwerpen', postalCode: '2000', country: 'BE' },
}

describe('validateDetails', () => {
  it('accepts complete details', () => {
    expect(validateDetails(valid)).toEqual({})
  })

  it('reports each missing or malformed field', () => {
    const errors = validateDetails({
      email: 'ada@',
      fullName: ' ',
      phone: 'call me',
      shippingAddress: { line1: '', line2: null, city: '', postalCode: '', country: 'US' },
    })
    expect(Object.keys(errors).sort()).toEqual(['city', 'country', 'email', 'fullName', 'line1', 'phone', 'postalCode'])
  })

  it('treats the phone number as optional', () => {
    expect(validateDetails({ ...valid, phone: null })).toEqual({})
  })
})
