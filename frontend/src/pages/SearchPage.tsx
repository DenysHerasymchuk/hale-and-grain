import { SearchLg } from '@untitledui/icons'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { CatalogView } from '@/features/catalog/components/CatalogView'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const term = searchParams.get('q') ?? ''
  const [draft, setDraft] = useState(term)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const q = draft.trim()
    setSearchParams(q ? { q } : {})
  }

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="font-display text-5xl text-primary md:text-6xl">Search</h1>
      <form role="search" onSubmit={submit} className="mt-8 flex max-w-2xl gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Search the collection</span>
          <SearchLg className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-fg-quaternary" aria-hidden />
          <input
            type="search"
            name="q"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Tables, oak, shelving…"
            autoFocus
            maxLength={100}
            className="w-full rounded-lg bg-primary py-3 pr-4 pl-12 text-md shadow-xs ring-1 ring-primary outline-none ring-inset focus:ring-2 focus:ring-brand"
          />
        </label>
        <Button type="submit" size="xl">
          Search
        </Button>
      </form>

      <div className="mt-10">
        {term ? (
          <CatalogView key={term} />
        ) : (
          <p className="text-tertiary">Search by name, category or material. Try “shelf” or “console”.</p>
        )}
      </div>
    </div>
  )
}
