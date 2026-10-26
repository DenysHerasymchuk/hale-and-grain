import { ArrowRight, Cube01 } from '@untitledui/icons'
import { motion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import { Price } from '@/components/Price/Price'
import BlurText from '@/components/reactbits/BlurText'
import { useProduct } from '@/features/catalog/hooks'
import { ModelErrorBoundary } from '@/features/viewer/ModelErrorBoundary'
import { useWebGLSupport } from '@/features/viewer/useWebGLSupport'
import { useInView } from '@/hooks/useInView'
import { routePaths } from '@/Routes/routePaths'
import { HeroBackdrop } from './HeroBackdrop'

const HeroModel = lazy(() => import('./HeroModel').then((m) => ({ default: m.HeroModel })))

const HERO_SLUG = 'atelier-drawer-cabinet'
const ease = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  const { ref, inView } = useInView<HTMLElement>('0px', false)
  const { data: product } = useProduct(HERO_SLUG)
  const webGL = useWebGLSupport()
  const poster = product?.images[0]
  const posterImage = poster && <img src={poster.url} alt={poster.altText} className="mx-auto h-full w-auto object-contain opacity-80 mix-blend-luminosity" />

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <HeroBackdrop paused={!inView} />

      <div className="container-page relative grid min-h-[min(calc(100dvh-7.5rem),56rem)] items-center gap-6 py-14 lg:grid-cols-[1fr_1.05fr] lg:py-10">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="glass-dark inline-flex rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide text-beige"
          >
            Autumn collection, 2026
          </motion.p>
          <BlurText
            as="h1"
            text="Furniture you can walk around before it arrives."
            animateBy="words"
            direction="bottom"
            delay={90}
            trigger="load"
            className="mt-6 font-display text-[clamp(2.75rem,5vw,4.5rem)] leading-[1.02] text-white"
          />
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease }}
            className="mt-6 max-w-md text-lg leading-relaxed text-neutral-300"
          >
            Solid timber, made to order in small batches. Turn any piece around in 3D and look at the joinery before you decide.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button href={routePaths.products} size="xl" iconTrailing={ArrowRight} className="bg-beige text-neutral-950 shadow-none ring-0 hover:bg-white">
              Shop the collection
            </Button>
            <Button href={`${routePaths.home}#in-3d`} size="xl" color="secondary" iconLeading={Cube01} className="glass-dark bg-white/8 text-white ring-0 hover:bg-white/15 hover:text-white">
              How the 3D view works
            </Button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 text-sm text-neutral-400"
          >
            Made to order in 6–8 weeks &middot; Free delivery over €750
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.2, ease }}
          className="relative h-[26rem] sm:h-[32rem] lg:h-[40rem]"
        >
          {product?.model && webGL ? (
            <ModelErrorBoundary fallback={() => posterImage}>
              <Suspense fallback={posterImage}>
                <HeroModel model={product.model} active={inView} />
              </Suspense>
            </ModelErrorBoundary>
          ) : (
            posterImage
          )}

          {product && (
            <Link
              to={routePaths.product(product.slug)}
              className="glass-dark group absolute bottom-4 left-1/2 flex w-max -translate-x-1/2 items-center gap-4 rounded-full py-2 pr-2 pl-5 text-sm transition-colors hover:bg-white/12 lg:bottom-10"
            >
              <span>
                <span className="font-medium text-white">{product.name}</span>
                <span className="ml-2 text-neutral-400">
                  from <Price amount={product.price} currency={product.currency} />
                </span>
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-beige text-neutral-950 transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
          )}
          <p className="pointer-events-none absolute top-2 right-2 text-xs text-neutral-500">Drag to turn</p>
        </motion.div>
      </div>
    </section>
  )
}
