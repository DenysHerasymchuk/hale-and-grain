import { formatMoney } from '@/lib/formatMoney'
import { cx } from '@/utils/cx'

export function Price({ amount, currency = 'EUR', className }: { amount: number; currency?: string; className?: string }) {
  return <span className={cx('tabular-nums', className)}>{formatMoney(amount, currency)}</span>
}
