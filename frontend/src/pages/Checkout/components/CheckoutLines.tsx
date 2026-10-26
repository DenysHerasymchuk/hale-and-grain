import { Price } from '@/components/Price/Price'
import type { QuoteLine } from '@/types/api'

/** Compact line list for the checkout summary, priced by the server quote. */
export function CheckoutLines({ lines, currency }: { lines: QuoteLine[]; currency: string }) {
  return (
    <ul className="mb-6 divide-y divide-border-primary border-b border-primary">
      {lines.map((line) => (
        <li key={line.variantId} className="flex gap-4 py-4 first:pt-0">
          {line.imageUrl && <img src={line.imageUrl} alt="" className="aspect-[4/5] w-14 rounded object-cover" />}
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-primary">{line.productName}</p>
            <p className="text-tertiary">
              {line.variantName} &middot; Qty {line.quantity}
            </p>
          </div>
          <Price amount={line.lineTotal} currency={currency} className="text-sm text-primary" />
        </li>
      ))}
    </ul>
  )
}
