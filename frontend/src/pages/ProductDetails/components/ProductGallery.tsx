import type { ProductImage } from '@/types/api'

export function ProductGallery({ images }: { images: ProductImage[] }) {
  if (images.length === 0) return null

  return (
    <section aria-label="Product photography">
      <ul className="grid grid-cols-2 gap-3 md:gap-4">
        {images.map((image) => (
          <li key={image.url}>
            <a href={image.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[var(--radius-card)] bg-secondary">
              <img src={image.url} alt={image.altText} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover transition-transform duration-700 hover:scale-[1.02] motion-reduce:transition-none" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
