import { ProductGrid } from '@/components/ProductGrid/ProductGrid'
import { useRelatedProducts } from '@/features/catalog/hooks'

export function RelatedProducts({ slug }: { slug: string }) {
  const { data: products } = useRelatedProducts(slug)

  if (!products || products.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="mt-24 border-t border-secondary pt-16">
      <h2 id="related-heading" className="font-display text-3xl text-primary md:text-4xl">
        You might also like
      </h2>
      <ProductGrid products={products.slice(0, 3)} className="mt-10" />
    </section>
  )
}
