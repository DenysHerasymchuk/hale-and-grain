import { SearchLg } from '@untitledui/icons'
import { useDeferredValue, useState } from 'react'
import { Price } from '@/components/Price/Price'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { useCustomers } from '@/features/admin/api'
import { AdminPageHeader, AdminPanel, tableClass } from './components/AdminPageHeader'

/** Read-only on purpose: customers manage their own details; staff see only what support needs. */
export function CustomersPage() {
  const [search, setSearch] = useState('')
  const query = useDeferredValue(search.trim())
  const { data: customers, isPending, isError, error, refetch } = useCustomers(query)

  return (
    <>
      <AdminPageHeader title="Customers" description="Accounts only. Guest checkouts appear under Orders." />
      <label className="relative mb-4 block max-w-sm">
        <span className="sr-only">Search customers</span>
        <SearchLg className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-quaternary" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-lg bg-primary_alt py-2 pr-3 pl-9 text-sm shadow-xs ring-1 ring-border-primary outline-none focus:ring-2 focus:ring-brand"
        />
      </label>
      {isPending ? (
        <LoadingState label="Loading customers" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <AdminPanel className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Joined</th>
                <th scope="col">Email</th>
                <th scope="col" className="text-right">
                  Orders
                </th>
                <th scope="col" className="text-right">
                  Spent
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <span className="block font-medium text-primary">{[customer.firstName, customer.lastName].filter(Boolean).join(' ') || '—'}</span>
                    <span className="text-xs text-tertiary">{customer.email}</span>
                  </td>
                  <td className="text-tertiary">{new Date(customer.createdAt).toLocaleDateString('en-IE', { dateStyle: 'medium' })}</td>
                  <td className="text-xs text-tertiary">{customer.emailConfirmed ? 'Confirmed' : 'Unconfirmed'}</td>
                  <td className="text-right tabular-nums">{customer.orderCount}</td>
                  <td className="text-right tabular-nums">
                    <Price amount={customer.totalSpent} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <p className="px-4 py-8 text-center text-sm text-tertiary">No customers found.</p>}
        </AdminPanel>
      )}
    </>
  )
}
