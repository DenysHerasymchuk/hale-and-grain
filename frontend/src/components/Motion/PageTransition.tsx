import { AnimatePresence, motion } from 'motion/react'
import { useLocation, useOutlet } from 'react-router'

/**
 * Cross-fades between routes. Keyed on pathname only, so filter and variant changes that
 * just touch the query string don't re-animate the page.
 */
export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
