import type { ReactNode } from 'react'

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-tertiary">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  )
}

export function AdminPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-xl bg-primary_alt shadow-xs ring-1 ring-border-secondary ${className}`}>{children}</section>
}

export const tableClass = 'w-full text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-medium [&_th]:tracking-wide [&_th]:text-tertiary [&_th]:uppercase [&_thead]:bg-secondary [&_tbody_tr]:border-t [&_tbody_tr]:border-secondary'
