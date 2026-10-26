import { ArrowRight, Cube01 } from '@untitledui/icons'
import { motion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { Button } from '@/components/base/buttons/button'
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

      <div className="container-page relative grid min-h-[calc(100svh-var(--chrome-h,7rem))] items-center gap-6 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-10">
        <div className="max-w-2xl">
          <BlurText
            as="h1"
            text="Furniture you can walk around before it arrives."
            animateBy="words"
            direction="bottom"
            delay={90}
            trigger="load"
            className="font-display text-[clamp(2.75rem,5vw,4.75rem)] leading-[1.02] text-white"
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

        </motion.div>
      </div>
    </section>
  )
}
