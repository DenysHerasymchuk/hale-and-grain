import { Button } from '@/components/base/buttons/button'
import { routePaths } from '@/Routes/routePaths'

export function AccessDeniedPage() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">Error 403</p>
      <h1 className="mt-4 font-display text-5xl text-primary">Staff only</h1>
      <p className="mt-4 max-w-md text-tertiary">Your account doesn&rsquo;t have access to this area. If you think it should, ask a store administrator.</p>
      <Button href={routePaths.home} size="lg" className="mt-8">
        Back to the store
      </Button>
    </section>
  )
}
