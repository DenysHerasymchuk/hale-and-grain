import { cx } from '@/utils/cx'

const steps = ['Cart', 'Details', 'Payment', 'Confirmation']

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Checkout progress" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {steps.map((step, index) => (
        <li key={step} aria-current={index === current ? 'step' : undefined} className={cx('flex items-center gap-2', index <= current ? 'text-primary' : 'text-quaternary')}>
          <span className={cx('flex size-6 items-center justify-center rounded-full text-xs tabular-nums', index < current ? 'bg-neutral-900 text-white' : index === current ? 'ring-1 ring-neutral-900' : 'ring-1 ring-border-primary')}>
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  )
}
