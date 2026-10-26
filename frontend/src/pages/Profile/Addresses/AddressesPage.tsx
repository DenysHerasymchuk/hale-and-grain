import { Plus } from '@untitledui/icons'
import { useState } from 'react'
import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useAddresses, useDeleteAddress } from '@/features/account/hooks'
import { countryName } from '@/features/checkout/shippingCountries'
import { AddressForm } from './components/AddressForm'

export function AddressesPage() {
  const { data: addresses, isPending, isError, error, refetch } = useAddresses()
  const remove = useDeleteAddress()
  // 'new' for the add form, an address id while editing, null otherwise.
  const [editing, setEditing] = useState<string | null>(null)

  if (isPending) return <LoadingState label="Loading addresses" />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-primary">Addresses</h1>
        {editing === null && (
          <Button size="sm" color="secondary" iconLeading={Plus} onPress={() => setEditing('new')}>
            Add address
          </Button>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {editing === 'new' && <AddressForm onDone={() => setEditing(null)} />}
        {addresses.length === 0 && editing !== 'new' && <p className="text-sm text-tertiary">No saved addresses yet.</p>}
        {addresses.map((address) =>
          editing === address.id ? (
            <AddressForm key={address.id} address={address} onDone={() => setEditing(null)} />
          ) : (
            <article key={address.id} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-secondary p-6 sm:flex-row sm:justify-between">
              <div className="text-sm leading-relaxed text-secondary">
                <h2 className="mb-2 flex items-center gap-2 font-medium text-primary">
                  {address.label}
                  {address.isDefault && (
                    <Badge type="pill-color" color="gray" size="sm">
                      Default
                    </Badge>
                  )}
                </h2>
                {address.fullName}
                <br />
                {address.line1}
                {address.line2 && `, ${address.line2}`}
                <br />
                {address.postalCode} {address.city}, {countryName(address.country)}
              </div>
              <div className="flex gap-2 sm:flex-col sm:items-end">
                <Button size="sm" color="link-gray" onPress={() => setEditing(address.id)}>
                  Edit
                </Button>
                <Button size="sm" color="link-destructive" isDisabled={remove.isPending} onPress={() => remove.mutate(address.id)}>
                  Delete
                </Button>
              </div>
            </article>
          ),
        )}
      </div>
    </>
  )
}
