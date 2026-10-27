import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cx } from '@/utils/cx'

export const controlClass =
  'w-full rounded-lg bg-primary_alt px-3 py-2 text-sm text-primary shadow-xs ring-1 ring-border-primary outline-none ring-inset placeholder:text-placeholder focus:ring-2 focus:ring-brand disabled:opacity-50'

interface FieldProps {
  label: string
  hint?: ReactNode
  className?: string
  children: (id: string) => ReactNode
}

/** Label + control + hint, wired together by id. Admin forms are dense, so these stay native. */
export function Field({ label, hint, className, children }: FieldProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-secondary">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-tertiary">{hint}</p>}
    </div>
  )
}

export function TextField({ label, hint, className, ...input }: { label: string; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => <input id={id} {...input} className={controlClass} />}
    </Field>
  )
}

export function TextAreaField({ label, hint, className, ...textarea }: { label: string; hint?: ReactNode } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => <textarea id={id} {...textarea} className={cx(controlClass, 'min-h-28 resize-y')} />}
    </Field>
  )
}

export function SelectField({ label, hint, className, children, ...select }: { label: string; hint?: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Field label={label} hint={hint} className={className}>
      {(id) => (
        <select id={id} {...select} className={controlClass}>
          {children}
        </select>
      )}
    </Field>
  )
}

export function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-secondary">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-neutral-900" />
      {label}
    </label>
  )
}
