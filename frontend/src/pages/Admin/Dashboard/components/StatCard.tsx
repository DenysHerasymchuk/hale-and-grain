import { Link } from 'react-router'
import { cx } from '@/utils/cx'

interface StatCardProps {
  label: string
  value: string
  tone?: 'neutral' | 'warning'
  href?: string
}

export function StatCard({ label, value, tone = 'neutral', href }: StatCardProps) {
  const body = (
    <>
      <p className="text-xs font-medium tracking-wide text-tertiary uppercase">{label}</p>
      <p className={cx('mt-2 font-display text-3xl tabular-nums', tone === 'warning' ? 'text-warning-primary' : 'text-primary')}>{value}</p>
    </>
  )
  const className = 'block rounded-xl bg-primary_alt p-5 shadow-xs ring-1 ring-border-secondary'
  return href ? (
    <Link to={href} className={cx(className, 'transition-shadow hover:shadow-md')}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
