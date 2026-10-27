import { lazy, Suspense, useDeferredValue } from 'react'
import { adminApi } from '@/features/admin/api'
import type { AdminModel } from '@/features/admin/types'
import { ModelErrorBoundary } from '@/features/viewer/ModelErrorBoundary'
import { CheckboxField, SelectField, TextField } from '../../components/Field'
import { UploadButton } from '../../components/UploadButton'

const FurnitureViewer3D = lazy(() => import('@/features/viewer/FurnitureViewer3D').then((m) => ({ default: m.FurnitureViewer3D })))

const blankModel: AdminModel = {
  url: '/models/',
  format: 'glb',
  fileSizeBytes: null,
  attribution: null,
  attributionUrl: null,
  license: null,
  config: { scale: 1, rotation: [0, 0, 0], offset: [0, 0, 0], cameraPosition: null, materialTargets: [] },
}

const degrees = (radians: number | undefined) => Math.round(((radians ?? 0) * 180) / Math.PI)
const radians = (deg: number) => (deg * Math.PI) / 180

interface ModelEditorProps {
  model: AdminModel | null
  productName: string
  previewTint: string | null
  onChange: (model: AdminModel | null) => void
}

export function ModelEditor({ model, productName, previewTint, onChange }: ModelEditorProps) {
  const preview = useDeferredValue(model)

  if (!model) {
    return <CheckboxField label="This product has a 3D model" checked={false} onChange={(on) => onChange(on ? blankModel : null)} />
  }

  const set = (changes: Partial<AdminModel>) => onChange({ ...model, ...changes })
  const setConfig = (changes: Partial<AdminModel['config']>) => onChange({ ...model, config: { ...model.config, ...changes } })
  const rotation = model.config.rotation

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <CheckboxField label="This product has a 3D model" checked onChange={(on) => onChange(on ? model : null)} />
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <TextField label="Model URL" required value={model.url} onChange={(e) => set({ url: e.target.value })} hint="Upload a .glb (up to 50 MB), or paste a path under /models/ or an https URL." />
          <SelectField label="Format" value={model.format} onChange={(e) => set({ format: e.target.value === 'gltf' ? 'gltf' : 'glb' })}>
            <option value="glb">GLB</option>
            <option value="gltf">glTF</option>
          </SelectField>
        </div>
        <UploadButton
          label="Upload .glb"
          accept=".glb,model/gltf-binary"
          upload={adminApi.uploadModel}
          onUploaded={([upload]) => upload && set({ url: upload.url, fileSizeBytes: upload.fileSizeBytes, format: 'glb' })}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Scale" type="number" step="any" min={0.001} value={model.config.scale} onChange={(e) => setConfig({ scale: Number(e.target.value) || 1 })} />
          <TextField
            label="Turn (degrees)"
            type="number"
            value={degrees(rotation[1])}
            onChange={(e) => setConfig({ rotation: [rotation[0] ?? 0, radians(Number(e.target.value)), rotation[2] ?? 0] })}
            hint="Rotates the model to face the camera."
          />
          <TextField
            label="Tinted materials"
            value={model.config.materialTargets.join(', ')}
            onChange={(e) => setConfig({ materialTargets: e.target.value.split(',').map((name) => name.trim()).filter(Boolean) })}
            hint="Material names in the file, comma-separated."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Attribution" value={model.attribution ?? ''} onChange={(e) => set({ attribution: e.target.value || null })} />
          <TextField label="Source URL" value={model.attributionUrl ?? ''} onChange={(e) => set({ attributionUrl: e.target.value || null })} />
          <TextField label="Licence" value={model.license ?? ''} onChange={(e) => set({ license: e.target.value || null })} />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-secondary">Preview</p>
        {preview && /\.(glb|gltf)$/i.test(preview.url) ? (
          <ModelErrorBoundary key={preview.url} fallback={() => <p className="rounded-lg bg-secondary p-4 text-sm text-tertiary">Could not load that file.</p>}>
            <Suspense fallback={<div className="aspect-square animate-pulse rounded-lg bg-secondary" />}>
              <FurnitureViewer3D key={preview.url} model={preview} productName={productName || 'product'} tint={previewTint} className="aspect-square" />
            </Suspense>
          </ModelErrorBoundary>
        ) : (
          <p className="rounded-lg bg-secondary p-4 text-sm text-tertiary">Upload a .glb or enter its URL to preview it.</p>
        )}
      </div>
    </div>
  )
}
