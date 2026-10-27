import { useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/base/badges/badges'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { adminApi, useAdminMutation, useInventory, useStoreSettings } from '@/features/admin/api'
import type { InventoryItem } from '@/features/admin/types'
import { routePaths } from '@/Routes/routePaths'
import { AdminPageHeader, AdminPanel, tableClass } from '../components/AdminPageHeader'
import { controlClass } from '../components/Field'

export function InventoryPage() {
  const { data: items, isPending, isError, error, refetch } = useInventory()
  const { data: settings } = useStoreSettings()
  const lowStock = settings?.lowStockThreshold ?? 3

  if (isPending) return <LoadingState label="Loading inventory" />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />

  return (
    <>
      <AdminPageHeader title="Inventory" description="Stock per finish, lowest first. Changes save when you press Enter or leave the field." />
      <AdminPanel className="overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Finish</th>
              <th scope="col">SKU</th>
              <th scope="col">Level</th>
              <th scope="col" className="w-36">
                In stock
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.variantId}>
                <td>
                  <Link to={routePaths.adminProductEdit(item.productId)} className="font-medium text-primary hover:underline">
                    {item.productName}
                  </Link>
                  {!item.isPublished && <span className="ml-2 text-xs text-tertiary">(draft)</span>}
                </td>
                <td className="text-secondary">{item.variantName}</td>
                <td className="text-tertiary tabular-nums">{item.sku}</td>
                <td>
                  {item.stock === 0 ? (
                    <Badge type="pill-color" color="error" size="sm">
                      Sold out
                    </Badge>
                  ) : item.stock <= lowStock ? (
                    <Badge type="pill-color" color="warning" size="sm">
                      Low
                    </Badge>
                  ) : (
                    <Badge type="pill-color" color="success" size="sm">
                      OK
                    </Badge>
                  )}
                </td>
                <td>
                  <StockInput item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminPanel>
    </>
  )
}

function StockInput({ item }: { item: InventoryItem }) {
  const [value, setValue] = useState(String(item.stock))
  const save = useAdminMutation((stock: number) => adminApi.updateStock(item.variantId, stock))

  const commit = () => {
    const stock = Math.max(0, Math.floor(Number(value)))
    if (Number.isNaN(stock) || stock === item.stock) return setValue(String(item.stock))
    save.mutate(stock)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        aria-label={`Stock for ${item.productName}, ${item.variantName}`}
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className={`${controlClass} w-20 tabular-nums`}
      />
      <span aria-live="polite" className="w-10 text-xs text-tertiary">
        {save.isPending ? 'Saving' : save.isError ? <span className="text-error-primary">Failed</span> : save.isSuccess ? 'Saved' : ''}
      </span>
    </div>
  )
}
