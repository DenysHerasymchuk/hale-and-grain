import { useEffect, useRef } from 'react'

/**
 * Publishes the sticky header's live height as --chrome-h on <html>, so full-screen
 * sections can size themselves to the space below it, promo banner open or closed.
 */
export function useChromeHeight() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const root = document.documentElement
    const observer = new ResizeObserver(([entry]) => {
      if (entry) root.style.setProperty('--chrome-h', `${entry.borderBoxSize[0]?.blockSize ?? element.offsetHeight}px`)
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--chrome-h')
    }
  }, [])

  return ref
}
