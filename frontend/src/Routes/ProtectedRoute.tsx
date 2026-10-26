import { Navigate, Outlet, useLocation } from 'react-router'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useSession } from '@/features/auth/useSession'
import { routePaths } from './routePaths'

/**
 * Sends guests to sign in, then back. This is a convenience only: every account endpoint
 * is authorised by the API, which is what actually protects customer data.
 */
export function ProtectedRoute() {
  const location = useLocation()
  const { data: session, isPending, isError, error, refetch } = useSession()

  if (isPending) return <LoadingState label="Checking your session" className="min-h-[50vh]" />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!session) {
    const returnTo = `${location.pathname}${location.search}`
    return <Navigate to={`${routePaths.login}?returnTo=${encodeURIComponent(returnTo)}`} replace />
  }
  return <Outlet />
}
