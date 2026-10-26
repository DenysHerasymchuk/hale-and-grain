import { useEffect, useRef, useState } from 'react'

/** Becomes true once the element scrolls near the viewport, then stays true. */
export function useInView<T extends Element>(rootMargin = '200px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || inView) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setInView(true)
    }, { rootMargin })
    observer.observe(element)
    return () => observer.disconnect()
  }, [inView, rootMargin])

  return { ref, inView }
}
