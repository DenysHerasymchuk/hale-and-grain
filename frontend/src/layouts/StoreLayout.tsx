import { Footer } from '@/components/Footer/Footer'
import { Header } from '@/components/Header/Header'
import { PageTransition } from '@/components/Motion/PageTransition'
import { CartToast } from '@/features/cart/components/CartToast'
import { useWishlistSync } from '@/features/wishlist/useWishlistSync'

export function StoreLayout() {
  useWishlistSync()

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:shadow-lg">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <PageTransition />
      </main>
      <Footer />
      <CartToast />
    </div>
  )
}
