const pillars = [
  {
    title: 'Solid timber throughout',
    text: "Tops, sides and backs are solid wood. We don't use veneered chipboard or MDF anywhere in a piece.",
  },
  {
    title: 'Pegged and housed joints',
    text: 'We use housings, pegged tenons and timber drawer runners. Joints like these tighten as the wood settles, and they come apart cleanly when something needs repair.',
  },
  {
    title: 'Made when you order',
    text: "We build in small batches against real orders, so there's no warehouse stock to clear at a discount.",
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
          Furniture you can fix
        </h2>
        <p className="mt-5 max-w-lg text-tertiary">
          Hale &amp; Grain started as a two-person workshop, and we still design every piece at the bench. Each top is signed underneath.
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
