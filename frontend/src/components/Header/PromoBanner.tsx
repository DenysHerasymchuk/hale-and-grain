import { ArrowRight, XClose } from '@untitledui/icons'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { routePaths } from '@/Routes/routePaths'

const STORAGE_KEY = 'hale-grain-promo-dismissed'

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Promo strip that slides down above the header and stays closed once dismissed. */
export function PromoBanner() {
  const [open, setOpen] = useState(false)

  // Open after mount so the slide-down plays instead of the strip just being there.
  useEffect(() => {
    if (wasDismissed()) return
    const timer = window.setTimeout(() => setOpen(true), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setOpen(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Private mode: it simply reappears next visit.
    }
  }

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-beige"
          >
            <div className="container-page flex items-center justify-center gap-3 py-2.5 pr-12 text-sm">
              <span className="hidden rounded-full bg-beige px-2 py-0.5 text-[0.7rem] font-semibold tracking-wider text-brand-800 uppercase sm:inline">Offer</span>
              <p className="text-center">
                <span className="font-medium text-white">Free delivery over €750</span>
                <span className="hidden sm:inline"> &middot; Every piece made to order in 6–8 weeks</span>
              </p>
              <Link to={routePaths.products} className="group hidden items-center gap-1 font-medium text-white underline-offset-4 hover:underline md:inline-flex">
                Shop now <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Hide this message"
              className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-beige transition-colors hover:bg-white/15 hover:text-white"
            >
              <XClose className="size-4" aria-hidden />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
