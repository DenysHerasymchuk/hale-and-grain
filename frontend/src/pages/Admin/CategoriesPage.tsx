import { Plus } from '@untitledui/icons'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/base/buttons/button'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { adminApi, useAdminCategories, useAdminMutation } from '@/features/admin/api'
import type { AdminCategory, AdminCategoryInput } from '@/features/admin/types'
import { ApiError } from '@/lib/apiClient'
import { AdminPageHeader, AdminPanel, tableClass } from './components/AdminPageHeader'
import { TextField } from './components/Field'

export function CategoriesPage() {
  const { data: categories, isPending, isError, error, refetch } = useAdminCategories()
  // 'new' while adding, a category id while editing.
  const [editing, setEditing] = useState<string | null>(null)
  const remove = useAdminMutation((id: string) => adminApi.deleteCategory(id))

  if (isPending) return <LoadingState label="Loading categories" />
  if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Shown in the header, footer and on the homepage, in display order."
        actions={
          editing === null && (
            <Button size="md" iconLeading={Plus} onPress={() => setEditing('new')}>
              New category
            </Button>
          )
        }
      />
      {editing === 'new' && <CategoryForm onDone={() => setEditing(null)} />}
      {remove.error instanceof ApiError && (
        <p role="alert" className="mb-4 rounded-lg bg-error-primary p-3 text-sm text-error-primary">
          {remove.error.messages.join(' ')}
        </p>
      )}
      <AdminPanel className="overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Name</th>
              <th scope="col">Slug</th>
              <th scope="col" className="text-right">
                Products
              </th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) =>
              editing === category.id ? (
                <tr key={category.id}>
                  <td colSpan={5}>
                    <CategoryForm category={category} onDone={() => setEditing(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={category.id}>
                  <td className="tabular-nums text-tertiary">{category.displayOrder}</td>
                  <td>
                    <span className="block font-medium text-primary">{category.name}</span>
                    <span className="line-clamp-1 text-xs text-tertiary">{category.description}</span>
                  </td>
                  <td className="text-tertiary">{category.slug}</td>
                  <td className="text-right tabular-nums">{category.productCount}</td>
                  <td className="text-right whitespace-nowrap">
                    <Button color="link-gray" size="sm" onPress={() => setEditing(category.id)}>
                      Edit
                    </Button>
                    <Button
                      color="link-destructive"
                      size="sm"
                      className="ml-3"
                      isDisabled={category.productCount > 0}
                      onPress={() => window.confirm(`Delete ${category.name}?`) && remove.mutate(category.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </AdminPanel>
      <p className="mt-3 text-xs text-tertiary">A category can only be deleted once it has no products.</p>
    </>
  )
}

function CategoryForm({ category, onDone }: { category?: AdminCategory; onDone: () => void }) {
  const [draft, setDraft] = useState<AdminCategoryInput>(
    category ?? { name: '', slug: '', description: '', imageUrl: null, displayOrder: 10 },
  )
  const save = useAdminMutation((input: AdminCategoryInput) => (category ? adminApi.updateCategory(category.id, input) : adminApi.createCategory(input)))
  const set = (changes: Partial<AdminCategoryInput>) => setDraft((current) => ({ ...current, ...changes }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate({ name: draft.name, slug: draft.slug, description: draft.description, imageUrl: draft.imageUrl, displayOrder: draft.displayOrder }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={submit} className="mb-4 space-y-4 rounded-xl bg-primary_alt p-5 ring-1 ring-border-secondary">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_8rem]">
        <TextField label="Name" required value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        <TextField label="Slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug} onChange={(e) => set({ slug: e.target.value.toLowerCase() })} />
        <TextField label="Display order" type="number" min={0} value={draft.displayOrder} onChange={(e) => set({ displayOrder: Number(e.target.value) })} />
      </div>
      <TextField label="Description" value={draft.description} onChange={(e) => set({ description: e.target.value })} />
      <TextField label="Image URL" value={draft.imageUrl ?? ''} onChange={(e) => set({ imageUrl: e.target.value || null })} />
      {save.error && (
        <p role="alert" className="text-sm text-error-primary">
          {save.error instanceof ApiError ? save.error.messages.join(' ') : 'Could not save.'}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={save.isPending}>
          Save
        </Button>
        <Button color="secondary" size="sm" onPress={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
