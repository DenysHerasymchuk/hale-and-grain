import type { CheckoutDetails } from '@/types/api'
import { shippingCountries } from './shippingCountries'

export type DetailsField = 'email' | 'fullName' | 'phone' | 'line1' | 'city' | 'postalCode' | 'country'
export type DetailsErrors = Partial<Record<DetailsField, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^\+?[\d\s()-]{6,30}$/

/** Friendly client-side checks. The API validates again and is the authority. */
export function validateDetails(details: CheckoutDetails): DetailsErrors {
  const errors: DetailsErrors = {}
  const { shippingAddress: address } = details

  if (!EMAIL.test(details.email.trim())) errors.email = 'Enter an email address like name@example.com.'
  if (details.fullName.trim().length < 2) errors.fullName = 'Enter the name the delivery should be addressed to.'
  if (details.phone && !PHONE.test(details.phone.trim())) errors.phone = 'Enter a phone number with digits only, optionally starting with +.'
  if (!address.line1.trim()) errors.line1 = 'Enter the street and house number.'
  if (!address.city.trim()) errors.city = 'Enter a town or city.'
  if (!address.postalCode.trim()) errors.postalCode = 'Enter a postcode.'
  if (!shippingCountries.some((c) => c.value === address.country)) errors.country = 'Choose a country we deliver to.'

  return errors
}
