import { useState, type FormEvent } from 'react'
import { Button } from '@/components/base/buttons/button'
import { NativeSelect } from '@/components/base/select/select-native'
import { Toggle } from '@/components/base/toggle/toggle'
import type { Category, ProductQuery } from '@/types/api'
import { sortOptions } from '../catalogParams'

interface ProductFiltersProps {
  query: ProductQuery
  categories: Category[]
  /** Hidden on category pages, where the category comes from the URL path. */
  showCategory: boolean
  onChange: (changes: Record<string, string | number | boolean | undefined>) => void
  onClear: () => void
}

export function ProductFilters({ query, categories, showCategory, onChange, onClear }: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-y border-secondary py-4 md:flex-row md:flex-wrap md:items-end">
      {showCategory && (
        <NativeSelect
          label="Category"
          size="sm"
          className="md:w-44"
          value={query.category ?? ''}
          onChange={(event) => onChange({ category: event.target.value || undefined })}
          options={[{ label: 'All categories', value: '' }, ...categories.map((c) => ({ label: c.name, value: c.slug }))]}
        />
      )}
      <PriceRange key={`${query.minPrice}-${query.maxPrice}`} min={query.minPrice} max={query.maxPrice} onApply={onChange} />
      <Toggle
        label="In stock only"
        size="sm"
        className="md:mb-2"
        isSelected={query.inStock === true}
        onChange={(selected) => onChange({ inStock: selected || undefined })}
      />
      <div className="flex items-end gap-3 md:ml-auto">
        <NativeSelect
          label="Sort by"
          size="sm"
          className="md:w-48"
          value={query.sort ?? 'featured'}
          onChange={(event) => onChange({ sort: event.target.value })}
          options={sortOptions}
        />
        <Button color="link-gray" size="sm" className="mb-2 shrink-0" onPress={onClear}>
          Clear all
        </Button>
      </div>
    </div>
  )
}

interface PriceRangeProps {
  min: number | undefined
  max: number | undefined
  onApply: (changes: { minPrice?: number; maxPrice?: number }) => void
}

/** Applied on submit rather than per keystroke, so typing "1500" does not fire four requests. */
function PriceRange({ min, max, onApply }: PriceRangeProps) {
  const [draftMin, setDraftMin] = useState(min?.toString() ?? '')
  const [draftMax, setDraftMax] = useState(max?.toString() ?? '')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const parse = (value: string) => (value.trim() === '' || Number.isNaN(Number(value)) ? undefined : Math.max(0, Number(value)))
    onApply({ minPrice: parse(draftMin), maxPrice: parse(draftMax) })
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <fieldset className="flex items-end gap-2">
        <legend className="mb-1.5 text-sm font-medium text-secondary">Price (€)</legend>
        <input
          aria-label="Minimum price"
          inputMode="numeric"
          placeholder="Min"
          value={draftMin}
          onChange={(event) => setDraftMin(event.target.value)}
          className="w-20 rounded-lg bg-primary px-3 py-2 text-sm shadow-xs ring-1 ring-primary outline-none ring-inset focus:ring-2 focus:ring-brand"
        />
        <span aria-hidden className="pb-2 text-tertiary">
          –
        </span>
        <input
          aria-label="Maximum price"
          inputMode="numeric"
          placeholder="Max"
          value={draftMax}
          onChange={(event) => setDraftMax(event.target.value)}
          className="w-20 rounded-lg bg-primary px-3 py-2 text-sm shadow-xs ring-1 ring-primary outline-none ring-inset focus:ring-2 focus:ring-brand"
        />
      </fieldset>
      <Button type="submit" color="secondary" size="sm">
        Apply
      </Button>
    </form>
  )
}
