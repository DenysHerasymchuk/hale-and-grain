import { motion } from 'motion/react'
import { Link } from 'react-router'
import { routePaths } from '@/Routes/routePaths'

// Studio renders of the other pieces; the Atelier cabinet itself turns in 3D next to the copy.
const cards = [
  { slug: 'lune-console', name: 'Lune Console', image: '/images/products/lune-console-1.webp', top: '8%' },
  { slug: 'orchard-display-shelf', name: 'Orchard Display Shelf', image: '/images/products/orchard-display-shelf-1.webp', top: '37%' },
  { slug: 'harrow-dining-table', name: 'Harrow Dining Table', image: '/images/products/harrow-dining-table-1.webp', top: '66%' },
]

const PEEK_CYCLE = 7.5 // seconds for all three to take a turn

/**
 * Photo cards tucked behind the right edge of the hero. Each slides out to peek in turn,
 * then hides again; hovering one pulls it out fully. Transforms only, no canvas.
 */
export function HeroPeekCards() {
  return (
    <div className="absolute inset-y-0 right-0 hidden w-48 xl:block">
      {cards.map((card, index) => (
        <motion.div
          key={card.slug}
          className="absolute right-0 w-48"
          style={{ top: card.top }}
          initial={{ x: '110%' }}
          animate={{ x: ['72%', '72%', '18%', '18%', '72%', '72%'] }}
          transition={{
            x: {
              duration: PEEK_CYCLE,
              times: [0, 0.08 + index * 0.25, 0.16 + index * 0.25, 0.3 + index * 0.25, 0.38 + index * 0.25, 1],
              ease: 'easeInOut',
              repeat: Infinity,
              delay: 1.2,
            },
          }}
          whileHover={{ x: '8%', transition: { duration: 0.35 } }}
        >
          <Link
            to={routePaths.product(card.slug)}
            className="glass-dark group block -rotate-3 overflow-hidden rounded-2xl p-1.5 transition-transform duration-500 hover:rotate-0"
          >
            <img src={card.image} alt={card.name} loading="lazy" className="aspect-[4/5] w-full rounded-xl object-cover" />
            <span className="block px-2 py-2 text-xs font-medium text-neutral-200">{card.name}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
