import Aurora from '@/components/reactbits/Aurora'

/**
 * Dark hero backdrop: espresso base with a low, warm aurora along the top edge. The
 * base alone is the fallback when WebGL 2 is unavailable; Aurora freezes itself under
 * reduced motion and stops drawing while off screen.
 */
export function HeroBackdrop({ paused }: { paused: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 bg-[#161412]">
      <Aurora
        colorStops={['#4a2d1f', '#985a37', '#c98d62', '#5f3824']}
        amplitude={1.1}
        blend={0.12}
        height={0.34}
        glow={0.12}
        brightness={0.55}
        opacity={0.85}
        layers={2}
        speed={0.6}
        // A soft gradient gains nothing from retina resolution; 1x is a quarter of the pixel work.
        dpr={1}
        paused={paused}
      />
    </div>
  )
}
