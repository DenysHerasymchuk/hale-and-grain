import { ArrowRight } from '@untitledui/icons'
import { Link } from 'react-router'

interface SectionHeadingProps {
  id: string
  eyebrow: string
  title: string
  link?: { to: string; label: string }
}

export function SectionHeading({ id, eyebrow, title, link }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-3 font-display text-4xl text-primary md:text-5xl">
          {title}
        </h2>
      </div>
      {link && (
        <Link to={link.to} className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary">
          {link.label} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  )
}
