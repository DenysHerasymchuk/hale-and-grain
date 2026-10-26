import { Minus, Plus } from '@untitledui/icons'
import { cx } from '@/utils/cx'

interface QuantitySelectorProps {
  value: number
  max: number
  onChange: (value: number) => void
  label?: string
  size?: 'sm' | 'md'
  isDisabled?: boolean
}

export function QuantitySelector({ value, max, onChange, label = 'Quantity', size = 'md', isDisabled = false }: QuantitySelectorProps) {
  const buttonClass = cx(
    'inline-flex items-center justify-center text-secondary transition-colors hover:bg-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40',
    size === 'sm' ? 'size-8' : 'size-11',
  )

  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-md ring-1 ring-border-primary ring-inset">
      <button type="button" aria-label="Decrease quantity" className={buttonClass} disabled={isDisabled || value <= 1} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" aria-hidden />
      </button>
      <output aria-live="polite" aria-label={`${label}: ${value}`} className={cx('text-center font-medium tabular-nums', size === 'sm' ? 'w-8 text-sm' : 'w-10')}>
        {value}
      </output>
      <button type="button" aria-label="Increase quantity" className={buttonClass} disabled={isDisabled || value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}
