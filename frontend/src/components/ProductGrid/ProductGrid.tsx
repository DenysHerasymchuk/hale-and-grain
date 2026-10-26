import { ProductCard } from '@/components/ProductCard/ProductCard'
import type { ProductSummary } from '@/types/api'
import { cx } from '@/utils/cx'

export function ProductGrid({ products, className }: { products: ProductSummary[]; className?: string }) {
  return (
    <ul className={cx('grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {products.map((product, index) => (
        <li key={product.id} className="has-focus-visible:ring-2 has-focus-visible:ring-focus-ring has-focus-visible:ring-offset-4 has-focus-visible:ring-offset-bg-primary rounded-[var(--radius-card)]">
          <ProductCard product={product} priority={index < 3} />
        </li>
      ))}
    </ul>
  )
}

export function ProductGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <ul aria-hidden className={cx('grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="animate-pulse motion-reduce:animate-none">
          <div className="aspect-[4/5] rounded-[var(--radius-card)] bg-secondary" />
          <div className="mt-4 h-3 w-20 rounded bg-secondary" />
          <div className="mt-2 h-5 w-40 rounded bg-secondary" />
        </li>
      ))}
    </ul>
  )
}
