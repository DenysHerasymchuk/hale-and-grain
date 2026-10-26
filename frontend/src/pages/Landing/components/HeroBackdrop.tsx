/** Dark hero backdrop: espresso base with a faint warm glow where the cabinet peeks in. Pure CSS, no GPU loop. */
export function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10"
      style={{ background: 'radial-gradient(45% 60% at 100% 55%, rgb(152 90 55 / 0.28), transparent 70%), #161412' }}
    />
  )
}
