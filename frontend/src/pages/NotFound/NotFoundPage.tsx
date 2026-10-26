import { Button } from '@/components/base/buttons/button'
import { routePaths } from '@/Routes/routePaths'

export function NotFoundPage() {
  return (
    <section className="container-page flex flex-col items-center py-32 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 font-display text-5xl text-primary">This room is empty</h1>
      <p className="mt-4 max-w-md text-tertiary">The page you were looking for has moved or never existed. The furniture, however, is right where we left it.</p>
      <div className="mt-8 flex gap-3">
        <Button href={routePaths.products} size="lg">
          Browse the collection
        </Button>
        <Button href={routePaths.home} color="secondary" size="lg">
          Go home
        </Button>
      </div>
    </section>
  )
}
