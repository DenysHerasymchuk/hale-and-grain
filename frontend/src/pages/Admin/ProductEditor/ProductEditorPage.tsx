import { ArrowLeft, Trash01 } from '@untitledui/icons'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { ErrorState, LoadingState } from '@/components/StatusViews/StatusViews'
import { adminApi, useAdminCategories, useAdminMutation, useAdminProduct } from '@/features/admin/api'
import type { AdminCategory, AdminProduct, AdminProductInput } from '@/features/admin/types'
import { ApiError } from '@/lib/apiClient'
import { routePaths } from '@/Routes/routePaths'
import { AdminPageHeader, AdminPanel } from '../components/AdminPageHeader'
import { CheckboxField, SelectField, TextAreaField, TextField } from '../components/Field'
import { ImagesEditor } from './components/ImagesEditor'
import { ModelEditor } from './components/ModelEditor'
import { VariantsEditor } from './components/VariantsEditor'

export function ProductEditorPage() {
  const { id } = useParams()
  const product = useAdminProduct(id)
  const categories = useAdminCategories()

  if ((id && product.isPending) || categories.isPending) return <LoadingState label="Loading product" />
  if (product.isError) return <ErrorState error={product.error} onRetry={() => void product.refetch()} />
  if (categories.isError) return <ErrorState error={categories.error} onRetry={() => void categories.refetch()} />

  return <ProductForm key={id ?? 'new'} product={product.data} categories={categories.data} />
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')

function blankProduct(categories: AdminCategory[]): AdminProductInput {
  return {
    name: '',
    slug: '',
    sku: 'HG-',
    shortDescription: '',
    description: '',
    price: 0,
    categoryId: categories[0]?.id ?? '',
    brand: 'Hale & Grain Studio',
    dimensions: null,
    materials: null,
    isPublished: false,
    isFeatured: false,
    images: [],
    variants: [{ id: null, sku: 'HG--STD', name: 'Standard', material: null, size: null, swatchHex: '#c8b49a', priceAdjustment: 0, stock: 0, modelTint: null }],
    model: null,
  }
}

function ProductForm({ product, categories }: { product: AdminProduct | undefined; categories: AdminCategory[] }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<AdminProductInput>(() => (product ? toInput(product) : blankProduct(categories)))
  const [slugTouched, setSlugTouched] = useState(Boolean(product))
  const set = (changes: Partial<AdminProductInput>) => setDraft((current) => ({ ...current, ...changes }))

  const save = useAdminMutation((input: AdminProductInput) => (product ? adminApi.updateProduct(product.id, input) : adminApi.createProduct(input)))
  const remove = useAdminMutation(() => adminApi.deleteProduct(product?.id ?? ''))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    save.mutate(draft, { onSuccess: (saved) => !product && void navigate(routePaths.adminProductEdit(saved.id), { replace: true }) })
  }

  const errors = save.error instanceof ApiError ? save.error.messages : save.error ? ['Could not save the product.'] : []

  return (
    <form onSubmit={submit}>
      <Link to={routePaths.adminProducts} className="mb-3 inline-flex items-center gap-1.5 text-sm text-tertiary hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Products
      </Link>
      <AdminPageHeader
        title={product ? draft.name || 'Untitled product' : 'New product'}
        description={product ? `Last saved ${new Date(product.updatedAt).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Saved as a draft until you publish it.'}
        actions={
          <>
            {product && (
              <Link to={routePaths.product(product.slug)} target="_blank" className="self-center px-2 text-sm text-secondary underline-offset-4 hover:underline">
                View in shop
              </Link>
            )}
            <Button type="submit" size="md" isLoading={save.isPending}>
              {product ? 'Save changes' : 'Create product'}
            </Button>
          </>
        }
      />

      <div aria-live="polite">
        {errors.length > 0 && (
          <ul role="alert" className="mb-6 space-y-1 rounded-lg bg-error-primary p-4 text-sm text-error-primary">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
        {save.isSuccess && <p className="mb-6 rounded-lg bg-success-primary p-4 text-sm text-success-primary">Saved. The shop shows the new version straight away.</p>}
      </div>

      <div className="space-y-6">
        <Section title="Details">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Name"
              required
              value={draft.name}
              onChange={(e) => set({ name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
            />
            <TextField
              label="URL slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={draft.slug}
              onChange={(e) => {
                setSlugTouched(true)
                set({ slug: slugify(e.target.value) })
              }}
              hint={`Shop address: /products/${draft.slug || '…'}`}
            />
            <TextField label="SKU" required value={draft.sku} onChange={(e) => set({ sku: e.target.value.toUpperCase() })} />
            <SelectField label="Category" value={draft.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
            <TextField label="Base price (€, incl. VAT)" type="number" min={0} step="0.01" required value={draft.price} onChange={(e) => set({ price: Number(e.target.value) })} />
            <TextField label="Designer / brand" value={draft.brand ?? ''} onChange={(e) => set({ brand: e.target.value || null })} />
            <TextField label="Dimensions" placeholder="W 120 × D 45 × H 80 cm" value={draft.dimensions ?? ''} onChange={(e) => set({ dimensions: e.target.value || null })} />
            <TextField label="Materials" value={draft.materials ?? ''} onChange={(e) => set({ materials: e.target.value || null })} />
          </div>
          <TextField className="mt-4" label="Short description" maxLength={500} value={draft.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })} hint="One or two sentences for cards and the top of the product page." />
          <TextAreaField className="mt-4" label="Full description" rows={6} maxLength={5000} value={draft.description} onChange={(e) => set({ description: e.target.value })} hint="Separate paragraphs with a blank line." />
          <div className="mt-4 flex flex-wrap gap-6">
            <CheckboxField label="Published in the shop" checked={draft.isPublished} onChange={(isPublished) => set({ isPublished })} />
            <CheckboxField label="Featured on the homepage" checked={draft.isFeatured} onChange={(isFeatured) => set({ isFeatured })} />
          </div>
        </Section>

        <Section title="Finishes and stock">
          <VariantsEditor variants={draft.variants} productSku={draft.sku} onChange={(variants) => set({ variants })} />
        </Section>

        <Section title="Photos">
          <ImagesEditor images={draft.images} onChange={(images) => set({ images })} />
        </Section>

        <Section title="3D model">
          <ModelEditor model={draft.model} productName={draft.name} previewTint={draft.variants[0]?.modelTint ?? null} onChange={(model) => set({ model })} />
        </Section>

        {product && (
          <Section title="Danger zone">
            <p className="mb-3 text-sm text-tertiary">Deleting removes the product from the shop. Past orders keep their own copy of the name and price.</p>
            <Button
              color="secondary-destructive"
              size="sm"
              iconLeading={Trash01}
              isLoading={remove.isPending}
              onPress={() => {
                if (window.confirm(`Delete ${product.name}? This can't be undone.`)) remove.mutate(undefined, { onSuccess: () => void navigate(routePaths.adminProducts) })
              }}
            >
              Delete product
            </Button>
          </Section>
        )}
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <AdminPanel className="p-5 md:p-6">
      <h2 className="mb-4 font-display text-xl text-primary">{title}</h2>
      {children}
    </AdminPanel>
  )
}

function toInput(product: AdminProduct): AdminProductInput {
  const { name, slug, sku, shortDescription, description, price, categoryId, brand, dimensions, materials, isPublished, isFeatured, images, variants, model } = product
  return { name, slug, sku, shortDescription, description, price, categoryId, brand, dimensions, materials, isPublished, isFeatured, images, variants, model }
}
