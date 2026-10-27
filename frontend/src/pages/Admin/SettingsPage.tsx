import { useState, type FormEvent } from 'react'
import { Button } from '@/components/base/buttons/button'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { adminApi, useAdminMutation, useStoreSettings } from '@/features/admin/api'
import type { StoreSettings } from '@/features/admin/types'
import { ApiError } from '@/lib/apiClient'
import { AdminPageHeader, AdminPanel } from './components/AdminPageHeader'
import { TextField } from './components/Field'

export function AdminSettingsPage() {
  const { data, isPending, isError, error, refetch } = useStoreSettings()

  if (isPending) return <LoadingState label="Loading settings" />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  return <SettingsForm settings={data} />
}

function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [draft, setDraft] = useState(settings)
  const save = useAdminMutation(adminApi.updateSettings)
  const set = (changes: Partial<StoreSettings>) => setDraft((current) => ({ ...current, ...changes }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(draft)
  }

  return (
    <>
      <AdminPageHeader title="Store settings" description="Delivery charges apply to every new quote and order straight away." />
      <AdminPanel className="max-w-2xl p-5 md:p-6">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Store name" required value={draft.storeName} onChange={(e) => set({ storeName: e.target.value })} />
            <TextField label="Support email" type="email" required value={draft.supportEmail} onChange={(e) => set({ supportEmail: e.target.value })} />
            <TextField label="Flat delivery charge (€)" type="number" min={0} step="0.01" value={draft.flatShippingCost} onChange={(e) => set({ flatShippingCost: Number(e.target.value) })} />
            <TextField
              label="Free delivery from (€)"
              type="number"
              min={0}
              step="0.01"
              value={draft.freeShippingThreshold}
              onChange={(e) => set({ freeShippingThreshold: Number(e.target.value) })}
              hint="Orders at or above this subtotal ship free."
            />
            <TextField
              label="Low-stock warning at"
              type="number"
              min={0}
              value={draft.lowStockThreshold}
              onChange={(e) => set({ lowStockThreshold: Math.floor(Number(e.target.value)) })}
              hint="Finishes at or below this count are flagged."
            />
          </div>
          <div aria-live="polite" className="text-sm">
            {save.isSuccess && <p className="text-success-primary">Settings saved.</p>}
            {save.error && <p className="text-error-primary">{save.error instanceof ApiError ? save.error.messages.join(' ') : 'Could not save.'}</p>}
          </div>
          <Button type="submit" size="md" isLoading={save.isPending}>
            Save settings
          </Button>
        </form>
      </AdminPanel>
    </>
  )
}
