import { Link, useParams } from 'react-router'
import { LoadingState } from '@/components/StatusViews/StatusViews'
import { CatalogView } from '@/features/catalog/components/CatalogView'
import { useCategories } from '@/features/catalog/hooks'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { routePaths } from '@/Routes/routePaths'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const { data: categories, isPending, isError } = useCategories()
  const category = categories?.find((c) => c.slug === slug)

  if (isPending) return <LoadingState label="Loading category" />
  // If the category list itself failed, still show products; CatalogView surfaces its own error.
  if (!isError && !category) return <NotFoundPage />

  return (
    <div className="container-page py-12 md:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-tertiary">
        <Link to={routePaths.products} className="hover:text-primary">
          All furniture
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span aria-current="page">{category?.name ?? slug}</span>
      </nav>
      <header className="mt-4 max-w-2xl">
        <h1 className="font-display text-5xl text-primary md:text-6xl">{category?.name ?? slug}</h1>
        {category?.description && <p className="mt-4 text-tertiary">{category.description}</p>}
      </header>
      <div className="mt-10">
        <CatalogView category={slug} />
      </div>
    </div>
  )
}
