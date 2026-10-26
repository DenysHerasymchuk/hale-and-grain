/**
 * Dark hero backdrop: a warm vignette that keeps the eye on the copy and the model.
 * Also the fallback for the animated particle sea when WebGL or motion is unavailable.
 */
export function HeroBackdrop(_props: { paused: boolean }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10"
      style={{
        background:
          'radial-gradient(60% 55% at 72% 55%, rgb(122 71 45 / 0.35), transparent 70%), radial-gradient(80% 60% at 20% 0%, rgb(54 49 44 / 0.9), transparent 70%), #161412',
      }}
    />
  )
}
