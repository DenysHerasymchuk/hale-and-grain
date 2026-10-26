import { ArrowRight, Cube01 } from '@untitledui/icons'
import { motion } from 'motion/react'
import { Button } from '@/components/base/buttons/button'
import BlurText from '@/components/reactbits/BlurText'
import { routePaths } from '@/Routes/routePaths'
import { HeroBackdrop } from './HeroBackdrop'

const ease = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <HeroBackdrop />

      {/*
        Transparent cutout of the Atelier cabinet, anchored to the screen's right edge.
        The outer layer slides it in until half the cabinet shows; the inner one leans
        out a little every few seconds. Both are transforms only, so they stay cheap.
      */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-0 hidden h-[96%] -translate-y-1/2 md:block"
        initial={{ x: '100%' }}
        animate={{ x: '50%' }}
        transition={{ duration: 1.6, delay: 0.4, ease }}
      >
        <motion.img
          src="/images/hero-cabinet.webp"
          alt=""
          className="h-full w-auto origin-bottom-left"
          animate={{ x: [0, '-9%', '-9%', 0], rotate: [0, -1.5, -1.5, 0] }}
          transition={{ duration: 2.6, times: [0, 0.35, 0.65, 1], ease: 'easeInOut', delay: 2.6, repeat: Infinity, repeatDelay: 3.5 }}
        />
      </motion.div>

      <div className="container-page pointer-events-none relative grid min-h-[calc(100svh-var(--chrome-h,7rem))] items-center py-14 lg:py-10">
        <div className="pointer-events-auto max-w-2xl">
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

      </div>
    </section>
  )
}
