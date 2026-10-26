import { ArrowRight } from '@untitledui/icons'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Input } from '@/components/base/input/input'
import { NativeSelect } from '@/components/base/select/select-native'
import { LoadingState } from '@/components/StatusViews/StatusViews'
import { useCartStore } from '@/features/cart/cartStore'
import { OrderSummary } from '@/features/cart/components/OrderSummary'
import { useCheckoutStore } from '@/features/checkout/checkoutStore'
import { useCartQuote } from '@/features/checkout/hooks'
import { shippingCountries } from '@/features/checkout/shippingCountries'
import { validateDetails, type DetailsErrors } from '@/features/checkout/validateDetails'
import { routePaths } from '@/Routes/routePaths'
import type { CheckoutDetails } from '@/types/api'
import { CheckoutLines } from './components/CheckoutLines'
import { CheckoutSteps } from './components/CheckoutSteps'
import { PrimaryButton } from '@/components/PrimaryButton/PrimaryButton'

const emptyDetails: CheckoutDetails = {
  email: '',
  fullName: '',
  phone: null,
  shippingAddress: { line1: '', line2: null, city: '', postalCode: '', country: 'BE' },
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const lineCount = useCartStore((state) => state.lines.length)
  const saved = useCheckoutStore((state) => state.details)
  const setDetails = useCheckoutStore((state) => state.setDetails)
  const { data: quote, isPending } = useCartQuote()
  const [details, setDraft] = useState<CheckoutDetails>(saved ?? emptyDetails)
  const [errors, setErrors] = useState<DetailsErrors>({})

  if (lineCount === 0) return <Navigate to={routePaths.cart} replace />

  const update = (changes: Partial<CheckoutDetails>) => setDraft((current) => ({ ...current, ...changes }))
  const updateAddress = (changes: Partial<CheckoutDetails['shippingAddress']>) =>
    setDraft((current) => ({ ...current, shippingAddress: { ...current.shippingAddress, ...changes } }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateDetails(details)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid] input')?.focus()
      return
    }
    setDetails(details)
    void navigate(routePaths.checkoutPayment)
  }

  return (
    <div className="container-page py-12 md:py-16">
      <CheckoutSteps current={1} />
      <h1 className="mt-8 font-display text-5xl text-primary">Delivery details</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_24rem] lg:items-start">
        <form noValidate onSubmit={submit} className="max-w-2xl space-y-10">
          <fieldset className="space-y-5">
            <legend className="mb-5 font-display text-2xl text-primary">Contact</legend>
            <Input label="Email" type="email" autoComplete="email" isRequired value={details.email} onChange={(email) => update({ email })} isInvalid={!!errors.email} hint={errors.email ?? 'We send the order confirmation and delivery updates here.'} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Full name" autoComplete="name" isRequired value={details.fullName} onChange={(fullName) => update({ fullName })} isInvalid={!!errors.fullName} hint={errors.fullName} />
              <Input label="Phone (optional)" type="tel" autoComplete="tel" value={details.phone ?? ''} onChange={(phone) => update({ phone: phone || null })} isInvalid={!!errors.phone} hint={errors.phone ?? 'For the delivery team only.'} />
            </div>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="mb-5 font-display text-2xl text-primary">Shipping address</legend>
            <Input label="Street and number" autoComplete="address-line1" isRequired value={details.shippingAddress.line1} onChange={(line1) => updateAddress({ line1 })} isInvalid={!!errors.line1} hint={errors.line1} />
            <Input label="Apartment, floor (optional)" autoComplete="address-line2" value={details.shippingAddress.line2 ?? ''} onChange={(line2) => updateAddress({ line2: line2 || null })} />
            <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
              <Input label="Postcode" autoComplete="postal-code" isRequired value={details.shippingAddress.postalCode} onChange={(postalCode) => updateAddress({ postalCode })} isInvalid={!!errors.postalCode} hint={errors.postalCode} />
              <Input label="Town or city" autoComplete="address-level2" isRequired value={details.shippingAddress.city} onChange={(city) => updateAddress({ city })} isInvalid={!!errors.city} hint={errors.city} />
            </div>
            <NativeSelect
              label="Country"
              autoComplete="country"
              value={details.shippingAddress.country}
              onChange={(event) => updateAddress({ country: event.target.value })}
              options={shippingCountries}
              hint={errors.country ?? 'We currently deliver within these EU countries.'}
            />
          </fieldset>

          <PrimaryButton type="submit" size="lg" iconTrailing={ArrowRight}>
            Continue to payment
          </PrimaryButton>
        </form>

        {isPending || !quote ? (
          <LoadingState label="Confirming prices" />
        ) : (
          <OrderSummary subtotal={quote.subtotal} shipping={quote.shippingCost} total={quote.total} currency={quote.currency} className="lg:sticky lg:top-32">
            <CheckoutLines lines={quote.lines} currency={quote.currency} />
          </OrderSummary>
        )}
      </div>
    </div>
  )
}
