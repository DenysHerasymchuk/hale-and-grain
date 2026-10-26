import { useState } from 'react'

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/** Checked once per mount; WebGL availability does not change during a session. */
export function useWebGLSupport(): boolean {
  const [supported] = useState(detectWebGL)
  return supported
}
