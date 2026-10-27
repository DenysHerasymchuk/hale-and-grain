import { Plus, SearchLg } from '@untitledui/icons'
import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/base/badges/badges'
import { Button } from '@/components/base/buttons/button'
import { Price } from '@/components/Price/Price'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useAdminProducts } from '@/features/admin/api'
import { routePaths } from '@/Routes/routePaths'
import { AdminPageHeader, AdminPanel, tableClass } from './components/AdminPageHeader'

export function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const query = useDeferredValue(search.trim())
  const { data: products, isPending, isError, error, refetch } = useAdminProducts(query)

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Unpublished products are hidden from the shop but keep their history."
        actions={
          <Button href={routePaths.adminProductNew} size="md" iconLeading={Plus}>
            New product
          </Button>
        }
      />

      <label className="relative mb-4 block max-w-sm">
        <span className="sr-only">Search products</span>
        <SearchLg className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-quaternary" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or SKU"
          className="w-full rounded-lg bg-primary_alt py-2 pr-3 pl-9 text-sm shadow-xs ring-1 ring-border-primary outline-none focus:ring-2 focus:ring-brand"
        />
      </label>

      {isPending ? (
        <LoadingState label="Loading products" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <AdminPanel className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col" className="text-right">
                  Price
                </th>
                <th scope="col" className="text-right">
                  Stock
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link to={routePaths.adminProductEdit(product.id)} className="flex items-center gap-3 hover:underline">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="size-10 rounded-md object-cover" />
                      ) : (
                        <span className="size-10 rounded-md bg-secondary" />
                      )}
                      <span>
                        <span className="block font-medium text-primary">{product.name}</span>
                        <span className="text-xs text-tertiary tabular-nums">
                          {product.sku} · {product.variantCount} {product.variantCount === 1 ? 'variant' : 'variants'}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="text-secondary">{product.categoryName}</td>
                  <td className="text-right tabular-nums">
                    <Price amount={product.price} />
                  </td>
                  <td className={`text-right tabular-nums ${product.totalStock === 0 ? 'text-error-primary' : ''}`}>{product.totalStock}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      <Badge type="pill-color" color={product.isPublished ? 'success' : 'gray'} size="sm">
                        {product.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {product.isFeatured && (
                        <Badge type="pill-color" color="brand" size="sm">
                          Featured
                        </Badge>
                      )}
                      {!product.hasModel && (
                        <Badge type="pill-color" color="warning" size="sm">
                          No 3D model
                        </Badge>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="px-4 py-8 text-center text-sm text-tertiary">No products match that search.</p>}
        </AdminPanel>
      )}
    </>
  )
}
