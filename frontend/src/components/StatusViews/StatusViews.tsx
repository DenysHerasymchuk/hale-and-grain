import { AlertCircle } from '@untitledui/icons'
import type { ReactNode } from 'react'
import { Button } from '@/components/base/buttons/button'
import { ApiError } from '@/lib/apiClient'
import { cx } from '@/utils/cx'

export function LoadingState({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cx('flex items-center justify-center gap-3 py-16 text-sm text-tertiary', className)}>
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" aria-hidden />
      {label}&hellip;
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cx('mx-auto flex max-w-md flex-col items-center py-20 text-center', className)}>
      <h2 className="font-display text-2xl text-primary">{title}</h2>
      {description && <p className="mt-3 text-sm leading-relaxed text-tertiary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  error: unknown
  title?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ error, title = 'Something went wrong', onRetry, className }: ErrorStateProps) {
  const message = error instanceof ApiError ? error.messages.join(' ') : 'An unexpected error occurred. Please try again.'
  return (
    <div role="alert" className={cx('mx-auto flex max-w-md flex-col items-center py-20 text-center', className)}>
      <AlertCircle className="size-8 text-fg-error-secondary" aria-hidden />
      <h2 className="mt-4 font-display text-2xl text-primary">{title}</h2>
      <p className="mt-3 text-sm text-tertiary">{message}</p>
      {onRetry && (
        <Button color="secondary" size="md" className="mt-6" onPress={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
