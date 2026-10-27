import { Navigate, Outlet, useLocation } from 'react-router'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useSession } from '@/features/auth/useSession'
import { routePaths } from './routePaths'

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
