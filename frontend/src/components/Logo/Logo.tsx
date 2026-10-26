import { Link } from 'react-router'
import { cx } from '@/utils/cx'

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link to="/" aria-label="Hale & Grain, home" className={cx('group inline-flex items-baseline gap-1.5', className)}>
      <span className={cx('font-display text-[1.6rem] leading-none font-medium tracking-tight', inverted ? 'text-white' : 'text-primary')}>
        Hale
      </span>
      <span className="font-display text-[1.6rem] leading-none text-brand-500 italic transition-transform duration-300 group-hover:-rotate-6">&amp;</span>
      <span className={cx('font-display text-[1.6rem] leading-none font-medium tracking-tight', inverted ? 'text-white' : 'text-primary')}>
        Grain
      </span>
    </Link>
  )
}
