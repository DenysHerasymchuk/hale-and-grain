import { Link } from 'react-router'
import { useCategories } from '@/features/catalog/hooks'
import { routePaths } from '@/Routes/routePaths'
import { SectionHeading } from './SectionHeading'

export function CategoryCollections() {
  const { data: categories, isPending, isError } = useCategories()

  if (isError) return null

  return (
    <section aria-labelledby="collections-heading" className="bg-secondary py-16 md:py-24">
      <div className="container-page">
        <SectionHeading id="collections-heading" eyebrow="Collections" title="Shop by room and use" />
        <ul className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <li key={index} aria-hidden className="aspect-[3/4] animate-pulse rounded-[var(--radius-card)] bg-tertiary motion-reduce:animate-none" />
              ))
            : categories.map((category) => (
                <li key={category.id}>
                  <Link to={routePaths.category(category.slug)} className="group relative block aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-tertiary">
                    {category.imageUrl && (
                      <img src={category.imageUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/60 to-transparent p-5 pt-16 text-white">
                      <h3 className="font-display text-2xl">{category.name}</h3>
                      <p className="mt-1 text-sm text-white/80">
                        {category.productCount} {category.productCount === 1 ? 'piece' : 'pieces'}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
        </ul>
      </div>
    </section>
  )
}
