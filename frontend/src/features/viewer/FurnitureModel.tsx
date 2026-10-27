import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { Box3, Color, Mesh, Sphere, type Material, type Object3D } from 'three'
import type { SafeModelConfig } from './modelConfig'

interface FurnitureModelProps {
  url: string
  config: SafeModelConfig
  tint: string | null
  onBoundsChange: (radius: number) => void
}

function hasColor(material: Material): material is Material & { color: Color } {
  return 'color' in material && material.color instanceof Color
}

function cloneWithTint(source: Object3D, targets: string[], tint: string | null) {
  const scene = source.clone(true)
  const clonedMaterials: Material[] = []
  const tintColor = tint ? new Color(tint) : null

  scene.traverse((node) => {
    if (!(node instanceof Mesh)) return
    node.castShadow = true
    node.receiveShadow = true

    const materials: Material[] = Array.isArray(node.material) ? node.material : [node.material]
    const replaced = materials.map((material) => {
      if (!tintColor || !targets.includes(material.name) || !hasColor(material)) return material
      const copy = material.clone()
      if (hasColor(copy)) copy.color.copy(tintColor)
      clonedMaterials.push(copy)
      return copy
    })
    node.material = Array.isArray(node.material) ? replaced : replaced[0]
  })

  return { scene, clonedMaterials }
}

export function FurnitureModel({ url, config, tint, onBoundsChange }: FurnitureModelProps) {
  const gltf = useGLTF(url)
  const { scene, clonedMaterials } = useMemo(
    () => cloneWithTint(gltf.scene, config.materialTargets, tint),
    [gltf.scene, config.materialTargets, tint],
  )

  useEffect(() => () => clonedMaterials.forEach((material) => material.dispose()), [clonedMaterials])

  const { scale } = config

  const radius = useMemo(() => new Box3().setFromObject(scene).getBoundingSphere(new Sphere()).radius, [scene])
  useEffect(() => onBoundsChange(radius * scale), [radius, scale, onBoundsChange])

  return <primitive object={scene} scale={scale} rotation={config.rotation} />
}
