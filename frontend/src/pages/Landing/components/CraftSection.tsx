const pillars = [
  {
    title: 'Solid timber, start to finish',
    text: 'No veneered chipboard, no hidden MDF backs. If a surface looks like wood, it is wood all the way through.',
  },
  {
    title: 'Joints, not just screws',
    text: 'Housings, pegged tenons and timber runners. Joinery that tightens with time and can be taken apart to repair.',
  },
  {
    title: 'Made when you order',
    text: 'We build in small batches against real orders, so nothing sits in a warehouse and nothing is discounted to clear.',
  },
]

export function CraftSection() {
  return (
    <section aria-labelledby="craft-heading" className="container-page grid items-center gap-12 py-16 md:py-28 lg:grid-cols-2 lg:gap-20">
      <div className="grid grid-cols-2 gap-4">
        <img src="/images/products/atelier-drawer-cabinet-4.webp" alt="Close view of the Atelier cabinet's drawer fronts and pulls" loading="lazy" className="aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover" />
        <img src="/images/products/harrow-dining-table-4.webp" alt="The framed plank top of the Harrow table" loading="lazy" className="mt-12 aspect-[4/5] w-full rounded-[var(--radius-card)] object-cover" />
      </div>
      <div>
        <p className="eyebrow">Craftsmanship</p>
        <h2 id="craft-heading" className="mt-3 font-display text-4xl text-primary md:text-5xl">
          Built to be repaired, not replaced
        </h2>
        <p className="mt-5 max-w-lg text-tertiary">
          Hale &amp; Grain started as a two-person workshop. We still design every piece at the bench, and we still sign the underside of every top.
        </p>
        <ul className="mt-10 divide-y divide-border-secondary border-y border-secondary">
          {pillars.map((pillar) => (
            <li key={pillar.title} className="py-6">
              <h3 className="font-display text-xl text-primary">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tertiary">{pillar.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
