import { ArrowRight, Cube01 } from '@untitledui/icons'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import BlurText from '@/components/reactbits/BlurText'
import { routePaths } from '@/Routes/routePaths'
import { HeroBackdrop } from './HeroBackdrop'
import { HeroModelStage } from './HeroModelStage'
import { HeroPeekCards } from './HeroPeekCards'
import { PrimaryButton } from '@/components/PrimaryButton/PrimaryButton'

const ease = [0.22, 1, 0.36, 1] as const

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <HeroBackdrop />

      <HeroPeekCards />

      <div className="container-page relative grid min-h-[calc(100svh-var(--chrome-h,7rem))] items-center gap-8 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-10 xl:pr-40">
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
            {/* Same box as the primary lg button: 18px/38px padding, 1.125rem text, 10px radius. */}
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

        <HeroModelStage />
      </div>
    </section>
  )
}
