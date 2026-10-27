import { ChevronDown } from '@untitledui/icons'
import type { ReactNode } from 'react'
import type { ProductDetail } from '@/types/api'

export function ProductInformation({ product }: { product: ProductDetail }) {
  return (
    <div className="divide-y divide-border-secondary border-y border-secondary">
      <Disclosure title="Description" defaultOpen>
        {product.description.split(/\n\s*\n/).map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="mt-3 first:mt-0">
            {paragraph}
          </p>
        ))}
      </Disclosure>
      <Disclosure title="Dimensions & materials">
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2">
          {product.dimensions && (
            <>
              <dt className="text-tertiary">Dimensions</dt>
              <dd>{product.dimensions}</dd>
            </>
          )}
          {product.materials && (
            <>
              <dt className="text-tertiary">Materials</dt>
              <dd>{product.materials}</dd>
            </>
          )}
          <dt className="text-tertiary">Designed by</dt>
          <dd>{product.brand ?? 'Hale & Grain Studio'}</dd>
        </dl>
      </Disclosure>
      <Disclosure title="Delivery & returns">
        <p>Made to order and delivered in 6–8 weeks. We deliver to your room of choice and take the packaging away.</p>
        <p className="mt-3">Free delivery on orders over €750; otherwise a flat €49. Returns accepted within 30 days of delivery, collected free of charge.</p>
      </Disclosure>
      {product.model?.attribution && (
        <Disclosure title="About the 3D model">
          <p>
            The interactive model is true to scale. Model:{' '}
            {product.model.attributionUrl ? (
              <a href={product.model.attributionUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {product.model.attribution}
              </a>
            ) : (
              product.model.attribution
            )}
            {product.model.license && `, licensed ${product.model.license}`}.
          </p>
        </Disclosure>
      )}
    </div>
  )
}

function Disclosure({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group py-1">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-medium text-primary">
        {title}
        <ChevronDown className="size-5 text-tertiary transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-secondary">{children}</div>
    </details>
  )
}
