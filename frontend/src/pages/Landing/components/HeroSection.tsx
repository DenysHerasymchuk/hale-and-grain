import { ArrowRight, Cube01 } from '@untitledui/icons'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import BlurText from '@/components/reactbits/BlurText'
import { routePaths } from '@/Routes/routePaths'
import { HeroBackdrop } from './HeroBackdrop'
import { PrimaryButton } from '@/components/PrimaryButton/PrimaryButton'

const ease = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <HeroBackdrop />

      <div className="container-page relative grid min-h-[calc(100svh-var(--chrome-h,7rem))] items-center gap-8 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-10">
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
            <PrimaryButton surface="dark" href={routePaths.products} size="lg" iconTrailing={ArrowRight}>
              Shop the collection
            </PrimaryButton>
            <Link
              to={`${routePaths.home}#in-3d`}
              className="glass-dark inline-flex items-center gap-2 rounded-[10px] px-[38px] py-[18px] text-[1.125rem] leading-none font-semibold text-white transition-colors hover:bg-white/15"
            >
              <Cube01 className="size-5" aria-hidden />
              How the 3D view works
            </Link>
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
          aria-hidden
          className="relative hidden h-[min(78svh,50rem)] lg:block"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease }}
        >
          <motion.img
            src="/images/hero-cabinet.webp"
            alt=""
            fetchPriority="high"
            className="mx-auto h-full w-auto object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.45)]"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity, delay: 1.4 }}
          />
        </motion.div>
      </div>
    </section>
  )
}
