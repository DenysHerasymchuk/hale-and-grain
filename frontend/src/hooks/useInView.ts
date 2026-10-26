import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether the element is near the viewport. With `once` (the default) it latches
 * true, which suits lazy mounting; without it, it follows the element in and out.
 */
export function useInView<T extends Element>(rootMargin = '200px', once = true) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || (once && inView)) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setInView(once ? (current) => current || entry.isIntersecting : entry.isIntersecting)
    }, { rootMargin })
    observer.observe(element)
    return () => observer.disconnect()
  }, [inView, once, rootMargin])

  return { ref, inView }
}
