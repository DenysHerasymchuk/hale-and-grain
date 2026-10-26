import { ArrowLeft, ArrowRight } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between border-t border-secondary pt-6">
      <Button color="secondary" size="sm" iconLeading={ArrowLeft} isDisabled={page <= 1} onPress={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <ol className="flex gap-1">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
          <li key={number}>
            <button
              type="button"
              aria-label={`Page ${number}`}
              aria-current={number === page ? 'page' : undefined}
              onClick={() => onPageChange(number)}
              className="size-9 rounded-md text-sm text-tertiary hover:bg-secondary aria-[current=page]:bg-neutral-900 aria-[current=page]:text-white"
            >
              {number}
            </button>
          </li>
        ))}
      </ol>
      <Button color="secondary" size="sm" iconTrailing={ArrowRight} isDisabled={page >= totalPages} onPress={() => onPageChange(page + 1)}>
        Next
      </Button>
    </nav>
  )
}
