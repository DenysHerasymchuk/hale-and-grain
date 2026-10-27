import { Cube01 } from '@untitledui/icons'
import { Link } from 'react-router'
import { Price } from '@/components/Price/Price'
import { routePaths } from '@/Routes/routePaths'
import type { ProductSummary } from '@/types/api'
import { cx } from '@/utils/cx'

interface ProductCardProps {
  product: ProductSummary
  className?: string
  priority?: boolean
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const soldOut = product.totalStock === 0

  return (
    <article className={cx('group relative flex flex-col', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-secondary transition-[box-shadow,translate] duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-xl motion-reduce:transition-none">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.imageAlt ?? product.name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-tertiary">No image yet</div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.hasModel && (
            <span className="glass inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-secondary">
              <Cube01 className="size-3.5" aria-hidden />
              View in 3D
            </span>
          )}
          {soldOut && <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white">Sold out</span>}
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">{product.categoryName}</p>
          <h3 className="mt-1 font-display text-lg leading-snug text-primary">
            <Link to={routePaths.product(product.slug)} className="after:absolute after:inset-0 focus-visible:outline-none">
              {product.name}
            </Link>
          </h3>
        </div>
        <Price amount={product.price} currency={product.currency} className="shrink-0 pt-5 text-sm font-medium text-primary" />
      </div>

      {product.swatches.length > 1 && (
        <ul className="mt-3 flex gap-1.5" aria-label={`${product.swatches.length} finishes available`}>
          {product.swatches.map((swatch) => (
            <li key={swatch.name} title={swatch.name} className="size-3.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: swatch.hex }} />
          ))}
        </ul>
      )}
    </article>
  )
}
