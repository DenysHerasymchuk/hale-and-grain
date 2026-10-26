import { Navigate, Outlet, useLocation } from 'react-router'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useSession } from '@/features/auth/useSession'
import { AccessDeniedPage } from '@/pages/AccessDenied/AccessDeniedPage'
import { routePaths } from './routePaths'

/** UI gate for the admin area. The API enforces the Admin role on every admin endpoint. */
export function AdminRoute() {
  const location = useLocation()
  const { data: session, isPending, isError, error, refetch } = useSession()

  if (isPending) return <LoadingState label="Checking your session" className="min-h-dvh" />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!session) return <Navigate to={`${routePaths.login}?returnTo=${encodeURIComponent(location.pathname)}`} replace />
  if (!session.isAdmin) return <AccessDeniedPage />
  return <Outlet />
}
