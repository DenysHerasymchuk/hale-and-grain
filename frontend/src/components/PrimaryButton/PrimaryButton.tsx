import type { FC, MouseEventHandler, ReactNode } from 'react'
import SpecularButton from '@/components/reactbits/SpecularButton'
import { cx } from '@/utils/cx'

const tones = {
  light: { tint: '#24211e', tintOpacity: 1, textColor: '#f2ece4', lineColor: '#e2d3ba', baseColor: '#4f4840', idleIntensity: 0.45 },
  dark: { tint: '#e2d3ba', tintOpacity: 0.14, textColor: '#f5efe6', lineColor: '#fff4e6', baseColor: '#675e52', idleIntensity: 0.4, blur: 6 },
}

interface PrimaryButtonProps {
  children: ReactNode
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
      autoAnimate
      speed={1.1}
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
