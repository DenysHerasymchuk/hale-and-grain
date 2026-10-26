import { ArrowRight, Cube01 } from '@untitledui/icons'
import { Link } from 'react-router'
import { Button } from '@/components/base/buttons/button'
import BlurText from '@/components/reactbits/BlurText'
import { routePaths } from '@/Routes/routePaths'

export function HeroSection() {
  return (
    <section className="container-page grid items-end gap-10 pt-10 pb-20 lg:grid-cols-[6fr_6fr] lg:gap-14 lg:pt-16">
      <div className="max-w-xl lg:pb-12">
        <p className="eyebrow">Autumn collection &middot; 2026</p>
        <BlurText
          as="h1"
          text="Furniture you can walk around before it arrives."
          animateBy="words"
          direction="bottom"
          delay={90}
          trigger="load"
          className="mt-5 font-display text-[clamp(2.75rem,5vw,4.5rem)] leading-[1.02] text-primary"
        />
        <p className="mt-6 max-w-md text-lg leading-relaxed text-tertiary">
          Solid-timber pieces, made to order in small batches. Turn each one in 3D, look under the top, check the joinery, then decide.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href={routePaths.products} size="xl" iconTrailing={ArrowRight}>
            Shop the collection
          </Button>
          <Button href={`${routePaths.home}#in-3d`} size="xl" color="secondary" iconLeading={Cube01}>
            Try the 3D viewer
          </Button>
        </div>
      </div>

      <figure className="relative">
        <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-secondary sm:aspect-[3/2]">
          <img src="/images/hero.webp" alt="The Lune console, Orchard display shelf and Harrow table arranged in a warm studio" fetchPriority="high" className="size-full object-cover" />
        </div>
        <figcaption className="absolute bottom-4 left-4 max-w-[16rem] rounded-md bg-primary/95 p-4 shadow-lg backdrop-blur sm:bottom-6 sm:left-6">
          <p className="eyebrow">Featured</p>
          <p className="mt-1 font-display text-lg text-primary">Lune Console</p>
          <Link to={routePaths.product('lune-console')} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">
            Inspect it in 3D <ArrowRight className="size-4" aria-hidden />
          </Link>
        </figcaption>
      </figure>
    </section>
  )
}
