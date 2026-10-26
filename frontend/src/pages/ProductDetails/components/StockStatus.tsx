import { cx } from '@/utils/cx'

const LOW_STOCK = 3

export function StockStatus({ stock }: { stock: number }) {
  const [label, tone] =
    stock === 0
      ? ['Sold out in this finish', 'bg-neutral-400']
      : stock <= LOW_STOCK
        ? [`Only ${stock} left in this batch`, 'bg-warning-solid']
        : ['In stock, ready to make', 'bg-success-solid']

  return (
    <p className="flex items-center gap-2 text-sm text-secondary">
      <span aria-hidden className={cx('size-2 rounded-full', tone)} />
      {label}
    </p>
  )
}
