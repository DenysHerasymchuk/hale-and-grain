import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { NotFoundPage } from '@/pages/NotFoundPage'

/** Last-resort boundary for errors thrown while rendering or lazy-loading a route. */
export function RouteErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />
  }

  console.error(error)

  return (
    <section role="alert" className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Unexpected error</p>
      <h1 className="mt-4 font-display text-4xl text-primary">Something came loose</h1>
      <p className="mt-4 max-w-md text-tertiary">This page failed to load. Reloading usually fixes it; if not, please let us know.</p>
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="mt-6 max-w-2xl overflow-auto rounded-md bg-secondary p-4 text-left text-xs text-secondary">{error.stack ?? error.message}</pre>
      )}
      <Button size="lg" className="mt-8" onPress={() => window.location.reload()}>
        Reload page
      </Button>
    </section>
  )
}
