import type { FC, MouseEventHandler, ReactNode } from 'react'
import SpecularButton from '@/components/reactbits/SpecularButton'
import { cx } from '@/utils/cx'

// Brand presets for the specular edge-light button. Each one is a WebGL canvas, so keep it
// to the single most important action on a page.
const tones = {
  // Charcoal glass with a beige edge light, for cream surfaces.
  light: { tint: '#24211e', tintOpacity: 1, textColor: '#f2ece4', lineColor: '#e2d3ba', baseColor: '#4f4840', idleIntensity: 0.45 },
  // Beige-tinted glass, for the dark hero and other dark sections.
  dark: { tint: '#e2d3ba', tintOpacity: 0.14, textColor: '#f5efe6', lineColor: '#fff4e6', baseColor: '#675e52', idleIntensity: 0.4, blur: 6 },
}

interface PrimaryButtonProps {
  children: ReactNode
  /** The surface the button sits on. */
  surface?: keyof typeof tones
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  type?: 'button' | 'submit'
  size?: 'sm' | 'md' | 'lg'
  isDisabled?: boolean
  isLoading?: boolean
  iconLeading?: FC<{ className?: string }>
  iconTrailing?: FC<{ className?: string }>
  className?: string
}

export function PrimaryButton({
  children,
  surface = 'light',
  href,
  onClick,
  type = 'button',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  iconLeading: Leading,
  iconTrailing: Trailing,
  className,
}: PrimaryButtonProps) {
  return (
    <SpecularButton
      {...tones[surface]}
      href={href}
      onClick={onClick}
      type={type}
      size={size}
      radius={10}
      disabled={isDisabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cx('group font-semibold', className)}
    >
      {isLoading ? (
        <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
      ) : (
        Leading && <Leading className="size-5" aria-hidden />
      )}
      {children}
      {Trailing && <Trailing className="size-5 transition-transform group-hover:translate-x-0.5" aria-hidden />}
    </SpecularButton>
  )
}
