import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useDashboard } from '@/features/admin/api'
import { formatMoney } from '@/lib/formatMoney'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { OrdersTable } from '../components/OrdersTable'
import { StatCard } from './components/StatCard'

export function DashboardPage() {
  const { data, isPending, isError, error, refetch } = useDashboard()

  if (isPending) return <LoadingState label="Loading dashboard" />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Last 30 days, cancelled orders excluded from revenue." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders today" value={String(data.ordersToday)} />
        <StatCard label="Orders, 30 days" value={String(data.ordersLast30Days)} />
        <StatCard label="Order value, 30 days" value={formatMoney(data.revenueLast30Days, data.currency)} />
        <StatCard
          label="Stock alerts"
          value={`${data.outOfStockVariants} out · ${data.lowStockVariants} low`}
          tone={data.outOfStockVariants > 0 ? 'warning' : 'neutral'}
          href="/admin/inventory"
        />
        <StatCard label="Published products" value={String(data.publishedProducts)} href="/admin/products" />
        <StatCard label="Customer accounts" value={String(data.customers)} href="/admin/customers" />
      </div>
      <h2 className="mt-10 mb-4 font-display text-xl text-primary">Recent orders</h2>
      <OrdersTable orders={data.recentOrders} />
    </>
  )
}
