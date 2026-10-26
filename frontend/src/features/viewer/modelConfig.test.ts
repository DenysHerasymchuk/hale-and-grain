import { normalizeModelConfig } from './modelConfig'

describe('normalizeModelConfig', () => {
  it('keeps a valid config as-is', () => {
    const config = normalizeModelConfig({ scale: 2, rotation: [0, 1.5, 0], offset: [0, 0.1, 0], cameraPosition: [1, 2, 3], materialTargets: ['oak'] })
    expect(config).toEqual({ scale: 2, rotation: [0, 1.5, 0], offset: [0, 0.1, 0], cameraPosition: [1, 2, 3], materialTargets: ['oak'] })
  })

  it('falls back to neutral defaults for malformed metadata', () => {
    const config = normalizeModelConfig({ scale: -1, rotation: [0, 1], offset: [Number.NaN, 0, 0], cameraPosition: null })
    expect(config).toEqual({ scale: 1, rotation: [0, 0, 0], offset: [0, 0, 0], cameraPosition: null, materialTargets: [] })
  })

  it('tolerates a missing config entirely', () => {
    expect(normalizeModelConfig(undefined).scale).toBe(1)
  })
})
