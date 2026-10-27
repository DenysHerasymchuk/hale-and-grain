import { CatalogView } from '@/features/catalog/components/CatalogView'

export function ProductsPage() {
  return (
    <div className="container-page py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">The collection</p>
        <h1 className="mt-3 font-display text-5xl text-primary md:text-6xl">All furniture</h1>
        <p className="mt-4 text-tertiary">Every piece is made to order in solid timber and can be inspected in 3D before you buy.</p>
      </header>
      <div className="mt-10">
        <CatalogView />
      </div>
    </div>
  )
}
