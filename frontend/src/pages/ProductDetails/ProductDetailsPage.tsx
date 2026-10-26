import { lazy, Suspense } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { Price } from '@/components/Price/Price'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useProduct } from '@/features/catalog/hooks'
import { ModelErrorBoundary } from '@/features/viewer/ModelErrorBoundary'
import { WishlistButton } from '@/features/wishlist/WishlistButton'
import { ApiError } from '@/lib/apiClient'
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage'
import { routePaths } from '@/Routes/routePaths'
import type { ProductDetail, ProductImage } from '@/types/api'
import { AddToCart } from './components/AddToCart'
import { ProductGallery } from './components/ProductGallery'
import { ProductInformation } from './components/ProductInformation'
import { RelatedProducts } from './components/RelatedProducts'
import { StockStatus } from './components/StockStatus'
import { VariantSelector } from './components/VariantSelector'

const FurnitureViewer3D = lazy(() => import('@/features/viewer/FurnitureViewer3D').then((m) => ({ default: m.FurnitureViewer3D })))

/** Selected finish lives in the URL (?variant=SKU) so it survives reloads and can be shared. */
function useSelectedVariant(product: ProductDetail | undefined) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = product?.variants.find((v) => v.sku === searchParams.get('variant'))
  const fallback = product?.variants.find((v) => v.stock > 0) ?? product?.variants[0]
  const select = (sku: string) =>
    setSearchParams(
      (params) => {
        params.set('variant', sku)
        return params
      },
      { replace: true, preventScrollReset: true },
    )
  return [requested ?? fallback, select] as const
}

export function ProductDetailsPage() {
  const { slug = '' } = useParams()
  const { data: product, isPending, isError, error, refetch } = useProduct(slug)
  const [variant, selectVariant] = useSelectedVariant(product)

  if (isPending) return <LoadingState label="Loading product" className="min-h-[60vh]" />
  if (isError) {
    if (error instanceof ApiError && error.status === 404) return <NotFoundPage />
    return <ErrorState error={error} title="We couldn't load this piece" onRetry={() => void refetch()} />
  }

  const poster = product.images[0]

  return (
    <div className="container-page py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-tertiary">
        <Link to={routePaths.products} className="hover:text-primary">
          All furniture
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <Link to={routePaths.category(product.categorySlug)} className="hover:text-primary">
          {product.categoryName}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <div className="lg:col-start-1 lg:row-start-1">
          <ProductStage product={product} tint={variant?.modelTint ?? null} poster={poster} />
        </div>

        <aside aria-label="Purchase options" className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <p className="eyebrow">{product.categoryName}</p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="font-display text-4xl leading-tight text-primary md:text-5xl">{product.name}</h1>
            <WishlistButton
              entry={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                categoryName: product.categoryName,
                imageUrl: poster?.url ?? null,
                price: product.price,
                currency: product.currency,
              }}
            />
          </div>
          <p className="mt-3 text-2xl text-primary">
            <Price amount={variant?.price ?? product.price} currency={product.currency} />
          </p>
          <p className="mt-5 leading-relaxed text-secondary">{product.shortDescription}</p>

          {variant ? (
            <div className="mt-8 space-y-6">
              <VariantSelector variants={product.variants} selectedSku={variant.sku} onChange={selectVariant} />
              <StockStatus stock={variant.stock} />
              <AddToCart product={product} variant={variant} />
              <p className="text-xs text-tertiary">
                SKU <span className="tabular-nums">{variant.sku}</span> &middot; Made to order, delivered in 6–8 weeks
              </p>
            </div>
          ) : (
            <p className="mt-8 text-sm text-tertiary">This piece is not available to order right now.</p>
          )}

          <div className="mt-10">
            <ProductInformation product={product} />
          </div>
        </aside>

        <div className="lg:col-start-1 lg:row-start-2">
          <ProductGallery images={product.images} />
        </div>
      </div>

      <RelatedProducts slug={product.slug} />
    </div>
  )
}

interface ProductStageProps {
  product: ProductDetail
  tint: string | null
  poster: ProductImage | undefined
}

function ProductStage({ product, tint, poster }: ProductStageProps) {
  const posterImage = poster ? { url: poster.url, alt: poster.altText } : null
  const stageClass = 'aspect-square w-full sm:aspect-[4/3]'

  if (!product.model) {
    return posterImage ? <img src={posterImage.url} alt={posterImage.alt} className={`${stageClass} rounded-[var(--radius-card)] object-cover`} /> : null
  }

  const posterFallback = posterImage && <img src={posterImage.url} alt={posterImage.alt} className={`${stageClass} rounded-[var(--radius-card)] object-cover`} />

  return (
    <ModelErrorBoundary fallback={() => posterFallback}>
      <Suspense fallback={posterFallback}>
        <FurnitureViewer3D model={product.model} productName={product.name} tint={tint} fallbackImage={posterImage} className={stageClass} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
