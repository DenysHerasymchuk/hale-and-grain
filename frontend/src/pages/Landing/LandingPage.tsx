import { Reveal } from '@/components/Motion/Reveal'
import { routePaths } from '@/Routes/routePaths'
import { CategoryCollections } from './components/CategoryCollections'
import { CraftSection } from './components/CraftSection'
import { HeroSection } from './components/HeroSection'
import { ProductShelf } from './components/ProductShelf'
import { ViewerShowcase } from './components/ViewerShowcase'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <Reveal>
        <ProductShelf
          id="featured-heading"
          eyebrow="Featured"
          title="Pieces we keep coming back to"
          query={{ featured: true, pageSize: 3, sort: 'featured' }}
          link={{ to: routePaths.products, label: 'View all furniture' }}
        />
      </Reveal>
      <Reveal>
        <CategoryCollections />
      </Reveal>
      <Reveal>
        <ViewerShowcase />
      </Reveal>
      <Reveal>
        <CraftSection />
      </Reveal>
      <Reveal>
        <ProductShelf
          id="new-heading"
          eyebrow="New in the studio"
          title="Just off the bench"
          query={{ sort: 'newest', pageSize: 3 }}
          link={{ to: `${routePaths.products}?sort=newest`, label: 'Shop new arrivals' }}
        />
      </Reveal>
    </>
  )
}
