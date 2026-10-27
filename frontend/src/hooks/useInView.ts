import { useEffect, useRef, useState } from 'react'

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
