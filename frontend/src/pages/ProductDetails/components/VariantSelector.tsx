import { Radio, RadioGroup, Label } from 'react-aria-components'
import type { ProductVariant } from '@/types/api'
import { cx } from '@/utils/cx'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedSku: string
  onChange: (sku: string) => void
}

export function VariantSelector({ variants, selectedSku, onChange }: VariantSelectorProps) {
  const selected = variants.find((variant) => variant.sku === selectedSku)

  if (variants.length < 2) return null

  return (
    <RadioGroup value={selectedSku} onChange={onChange} orientation="horizontal" className="flex flex-col gap-3">
      <Label className="text-sm text-secondary">
        Finish: <span className="font-medium text-primary">{selected?.name}</span>
      </Label>
      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => (
          <Radio
            key={variant.sku}
            value={variant.sku}
            aria-label={`${variant.name}${variant.stock === 0 ? ', sold out' : ''}`}
            className={({ isSelected, isFocusVisible }) =>
              cx(
                'relative size-11 cursor-pointer rounded-full p-1 ring-1 ring-border-primary transition-shadow outline-none',
                isSelected && 'ring-2 ring-neutral-900',
                isFocusVisible && 'ring-2 ring-focus-ring ring-offset-2 ring-offset-bg-primary',
              )
            }
          >
            <span className="block size-full rounded-full ring-1 ring-black/10 ring-inset" style={{ backgroundColor: variant.swatchHex }} />
            {variant.stock === 0 && (
              <span aria-hidden className="absolute inset-0 m-auto h-px w-9 -rotate-45 bg-neutral-900/70" />
            )}
          </Radio>
        ))}
      </div>
    </RadioGroup>
  )
}
