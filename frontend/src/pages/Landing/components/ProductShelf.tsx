import { ProductGrid, ProductGridSkeleton } from '@/components/ProductGrid/ProductGrid'
import { useProducts } from '@/features/catalog/hooks'
import type { ProductQuery } from '@/types/api'
import { SectionHeading } from './SectionHeading'

interface ProductShelfProps {
  id: string
  eyebrow: string
  title: string
  query: ProductQuery
  link?: { to: string; label: string }
}

/** A titled row of products from the live catalogue; degrades to a short note if the API is down. */
export function ProductShelf({ id, eyebrow, title, query, link }: ProductShelfProps) {
  const { data, isPending, isError } = useProducts(query)

  return (
    <section aria-labelledby={id} className="container-page py-16 md:py-24">
      <SectionHeading id={id} eyebrow={eyebrow} title={title} link={link} />
      <div className="mt-10">
        {isPending ? (
          <ProductGridSkeleton count={query.pageSize ?? 3} />
        ) : isError ? (
          <p className="rounded-md border border-secondary px-5 py-8 text-center text-sm text-tertiary">
            The collection is taking a moment to load. Please refresh, or browse again shortly.
          </p>
        ) : (
          <ProductGrid products={data.items} />
        )}
      </div>
    </section>
  )
}
