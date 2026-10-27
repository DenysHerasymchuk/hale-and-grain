export function HeroBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 bg-[#161412]">
      <img
        src="/images/hero-joinery.webp"
        alt=""
        className="absolute inset-0 size-full object-cover object-right -translate-x-[12%] -scale-x-100 opacity-[0.07] mix-blend-luminosity"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, #161412 0%, rgb(22 20 18 / 0.85) 35%, transparent 70%), radial-gradient(45% 60% at 100% 55%, rgb(152 90 55 / 0.28), transparent 70%)',
        }}
      />
    </div>
  )
}
