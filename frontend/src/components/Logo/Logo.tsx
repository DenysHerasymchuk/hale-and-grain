import { Link } from 'react-router'
import { cx } from '@/utils/cx'

/**
 * The wordmark PNG is an alpha mask, so CSS sets its colour: beige on dark surfaces (the
 * default) and ink on cream ones. Source artwork: assets/brand/logo-source.png.
 */
export function Logo({ className, tone = 'beige' }: { className?: string; tone?: 'beige' | 'ink' }) {
  return (
    <Link to="/" aria-label="Hale & Grain, home" className={cx('group inline-block', className)}>
      <span
        aria-hidden
        className={cx('block h-6 w-37 transition-colors duration-300 sm:h-7 sm:w-43', tone === 'beige' ? 'bg-beige group-hover:bg-white' : 'bg-neutral-900 group-hover:bg-brand-700')}
        style={{ mask: 'url(/logo-wordmark.png) center / contain no-repeat', WebkitMask: 'url(/logo-wordmark.png) center / contain no-repeat' }}
      />
    </Link>
  )
}
