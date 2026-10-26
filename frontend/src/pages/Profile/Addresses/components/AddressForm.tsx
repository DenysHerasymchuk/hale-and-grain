import { useState, type FormEvent } from 'react'
import { Button } from '@/components/base/buttons/button'
import { Checkbox } from '@/components/base/checkbox/checkbox'
import { Input } from '@/components/base/input/input'
import { NativeSelect } from '@/components/base/select/select-native'
import { useSaveAddress } from '@/features/account/hooks'
import { shippingCountries } from '@/features/checkout/shippingCountries'
import { ApiError } from '@/lib/apiClient'
import type { Address, SaveAddress } from '@/types/api'

const blank: SaveAddress = { label: 'Home', fullName: '', line1: '', line2: null, city: '', postalCode: '', country: 'BE', isDefault: false }

export function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const save = useSaveAddress()
  const [draft, setDraft] = useState<SaveAddress>(address ?? blank)
  const set = (changes: Partial<SaveAddress>) => setDraft((current) => ({ ...current, ...changes }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate({ id: address?.id, address: draft }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-[var(--radius-card)] border border-secondary p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Label" isRequired maxLength={50} value={draft.label} onChange={(label) => set({ label })} hint="For example Home or Studio." />
        <Input label="Full name" autoComplete="name" isRequired value={draft.fullName} onChange={(fullName) => set({ fullName })} />
      </div>
      <Input label="Street and number" autoComplete="address-line1" isRequired value={draft.line1} onChange={(line1) => set({ line1 })} />
      <Input label="Apartment, floor (optional)" autoComplete="address-line2" value={draft.line2 ?? ''} onChange={(line2) => set({ line2: line2 || null })} />
      <div className="grid gap-4 sm:grid-cols-[10rem_1fr_1fr]">
        <Input label="Postcode" autoComplete="postal-code" isRequired value={draft.postalCode} onChange={(postalCode) => set({ postalCode })} />
        <Input label="Town or city" autoComplete="address-level2" isRequired value={draft.city} onChange={(city) => set({ city })} />
        <NativeSelect label="Country" value={draft.country} onChange={(event) => set({ country: event.target.value })} options={shippingCountries} />
      </div>
      <Checkbox label="Use as my default address" isSelected={draft.isDefault} onChange={(isDefault) => set({ isDefault })} />
      {save.error && (
        <p role="alert" className="text-sm text-error-primary">
          {save.error instanceof ApiError ? save.error.messages.join(' ') : 'Could not save this address.'}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" size="md" isLoading={save.isPending}>
          Save address
        </Button>
        <Button color="secondary" size="md" onPress={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
