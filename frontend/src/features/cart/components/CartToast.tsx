import { Check, XClose } from '@untitledui/icons'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { Link } from 'react-router'
import { routePaths } from '@/Routes/routePaths'
import { useCartNotice } from '../cartNotice'

const VISIBLE_MS = 4000

/** Glass confirmation that slides in under the header after an add-to-cart. */
export function CartToast() {
  const notice = useCartNotice((state) => state.notice)
  const dismiss = useCartNotice((state) => state.dismiss)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(dismiss, VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [notice, dismiss])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 top-28 z-50 flex justify-end sm:inset-x-auto sm:right-6">
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="glass pointer-events-auto flex w-full max-w-sm items-center gap-4 rounded-2xl p-3 pr-4"
          >
            {notice.imageUrl && <img src={notice.imageUrl} alt="" className="size-16 rounded-xl object-cover" />}
            <div className="min-w-0 flex-1 text-sm">
              <p className="flex items-center gap-1.5 font-medium text-primary">
                <Check className="size-4 text-fg-success-primary" aria-hidden />
                Added to your cart
              </p>
              <p className="truncate text-tertiary">
                {notice.quantity > 1 && `${notice.quantity} × `}
                {notice.name}, {notice.variantName}
              </p>
              <Link to={routePaths.cart} onClick={dismiss} className="mt-1 inline-block font-medium text-brand-700 hover:underline">
                View cart
              </Link>
            </div>
            <button type="button" onClick={dismiss} aria-label="Dismiss" className="self-start rounded-full p-1 text-tertiary hover:bg-black/5">
              <XClose className="size-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
