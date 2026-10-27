import { Plus, Trash01 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import type { AdminVariant } from '@/features/admin/types'
import { controlClass } from '../../components/Field'

const blankVariant = (sku: string): AdminVariant => ({
  id: null,
  sku,
  name: '',
  material: null,
  size: null,
  swatchHex: '#c8b49a',
  priceAdjustment: 0,
  stock: 0,
  modelTint: null,
})

interface VariantsEditorProps {
  variants: AdminVariant[]
  productSku: string
  onChange: (variants: AdminVariant[]) => void
}

/** Finishes: each one is a buyable SKU with its own stock, price adjustment and 3D tint. */
export function VariantsEditor({ variants, productSku, onChange }: VariantsEditorProps) {
  const update = (index: number, changes: Partial<AdminVariant>) => onChange(variants.map((v, i) => (i === index ? { ...v, ...changes } : v)))

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[1.4fr_1fr_5rem_6rem_6rem_5rem_2.5rem] gap-2 px-1 text-xs font-medium tracking-wide text-tertiary uppercase lg:grid">
        <span>SKU</span>
        <span>Name</span>
        <span>Swatch</span>
        <span>3D tint</span>
        <span>+ Price €</span>
        <span>Stock</span>
        <span />
      </div>
      {variants.map((variant, index) => (
        <fieldset key={variant.id ?? `new-${index}`} className="grid gap-2 rounded-lg bg-secondary p-2 lg:grid-cols-[1.4fr_1fr_5rem_6rem_6rem_5rem_2.5rem] lg:items-center lg:bg-transparent lg:p-0">
          <legend className="sr-only">Variant {index + 1}</legend>
          <input aria-label="SKU" required value={variant.sku} onChange={(e) => update(index, { sku: e.target.value.toUpperCase() })} className={controlClass} />
          <input aria-label="Name" required value={variant.name} onChange={(e) => update(index, { name: e.target.value, material: e.target.value })} className={controlClass} />
          <input aria-label="Swatch colour" type="color" value={variant.swatchHex} onChange={(e) => update(index, { swatchHex: e.target.value })} className="h-9 w-full cursor-pointer rounded-lg" />
          <span className="flex items-center gap-1.5">
            <input
              aria-label="Tint the 3D model"
              type="checkbox"
              checked={variant.modelTint !== null}
              onChange={(e) => update(index, { modelTint: e.target.checked ? variant.swatchHex : null })}
              className="size-4 accent-neutral-900"
            />
            <input
              aria-label="3D tint colour"
              type="color"
              disabled={variant.modelTint === null}
              value={variant.modelTint ?? '#ffffff'}
              onChange={(e) => update(index, { modelTint: e.target.value })}
              className="h-9 w-full cursor-pointer rounded-lg disabled:opacity-30"
            />
          </span>
          <input aria-label="Price adjustment" type="number" step="0.01" value={variant.priceAdjustment} onChange={(e) => update(index, { priceAdjustment: Number(e.target.value) })} className={controlClass} />
          <input aria-label="Stock" type="number" min={0} value={variant.stock} onChange={(e) => update(index, { stock: Math.max(0, Math.floor(Number(e.target.value))) })} className={controlClass} />
          <button
            type="button"
            aria-label={`Remove variant ${variant.name || index + 1}`}
            disabled={variants.length === 1}
            onClick={() => onChange(variants.filter((_, i) => i !== index))}
            className="flex size-9 items-center justify-center rounded-lg text-tertiary hover:bg-error-primary hover:text-error-primary disabled:opacity-30"
          >
            <Trash01 className="size-4" aria-hidden />
          </button>
        </fieldset>
      ))}
      <Button color="secondary" size="sm" iconLeading={Plus} onPress={() => onChange([...variants, blankVariant(`${productSku}-${variants.length + 1}`)])}>
        Add finish
      </Button>
      <p className="text-xs text-tertiary">Every product needs at least one finish; stock lives on finishes. The 3D tint multiplies into the model&rsquo;s target materials.</p>
    </div>
  )
}
