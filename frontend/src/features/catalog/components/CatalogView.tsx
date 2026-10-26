import { useSearchParams } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { Pagination } from '@/components/Pagination/Pagination'
import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid/ProductGrid'
import { EmptyState, ErrorState } from '@/components/StatusViews/StatusViews'
import { readCatalogParams, updateCatalogParams } from '../catalogParams'
import { useCategories, useProducts } from '../hooks'
import { ProductFilters } from './ProductFilters'

interface CatalogViewProps {
  /** Fixes the category (category pages); otherwise it is a filter in the URL. */
  category?: string
}

/** Filters, results grid and pagination, all driven by the URL query string. */
export function CatalogView({ category }: CatalogViewProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = readCatalogParams(searchParams)
  const query = category ? { ...urlQuery, category } : urlQuery
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProducts(query)
  const { data: categories = [] } = useCategories()

  const change = (changes: Record<string, string | number | boolean | undefined>) => setSearchParams(updateCatalogParams(searchParams, changes))
  const clear = () => setSearchParams(query.q ? { q: query.q } : {})
  const goToPage = (page: number) => {
    change({ page: page > 1 ? page : undefined })
    window.scrollTo({ top: 0 })
  }

  return (
    <div>
      <ProductFilters query={query} categories={categories} showCategory={!category} onChange={change} onClear={clear} />

      <p aria-live="polite" className="mt-6 text-sm text-tertiary">
        {data && `${data.totalCount} ${data.totalCount === 1 ? 'piece' : 'pieces'}${query.q ? ` matching “${query.q}”` : ''}`}
      </p>

      <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
        {isPending ? (
          <ProductGridSkeleton className="mt-6" />
        ) : isError ? (
          <ErrorState error={error} title="We couldn't load the collection" onRetry={() => void refetch()} />
        ) : data.items.length === 0 ? (
          <EmptyState
            title="Nothing matches those filters"
            description="Try widening the price range, or clear the filters to see the whole collection."
            action={
              <Button color="secondary" size="md" onPress={clear}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <ProductGrid products={data.items} className="mt-6" />
            <div className="mt-16">
              <Pagination page={data.page} totalPages={data.totalPages} onPageChange={goToPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
