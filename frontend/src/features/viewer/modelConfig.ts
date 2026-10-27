import type { ModelConfig } from '@/types/api'

export type Vec3 = [number, number, number]

export interface SafeModelConfig {
  scale: number
  rotation: Vec3
  offset: Vec3
  cameraPosition: Vec3 | null
  materialTargets: string[]
}

function toVec3(values: unknown): Vec3 | null {
  if (!Array.isArray(values) || values.length !== 3) return null
  return values.every((value) => typeof value === 'number' && Number.isFinite(value)) ? (values as Vec3) : null
}

export function normalizeModelConfig(config: Partial<ModelConfig> | null | undefined): SafeModelConfig {
  const scale = typeof config?.scale === 'number' && Number.isFinite(config.scale) && config.scale > 0 ? config.scale : 1
  return {
    scale,
    rotation: toVec3(config?.rotation) ?? [0, 0, 0],
    offset: toVec3(config?.offset) ?? [0, 0, 0],
    cameraPosition: toVec3(config?.cameraPosition),
    materialTargets: Array.isArray(config?.materialTargets) ? config.materialTargets.filter((name) => typeof name === 'string') : [],
  }
}
