import { ArrowDown, ArrowUp, Plus, Trash01 } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import type { AdminImage } from '@/features/admin/types'
import type { ImageRole } from '@/types/api'
import { controlClass } from '../../components/Field'

const roles: ImageRole[] = ['primary', 'gallery', 'detail', 'lifestyle']

export function ImagesEditor({ images, onChange }: { images: AdminImage[]; onChange: (images: AdminImage[]) => void }) {
  const update = (index: number, changes: Partial<AdminImage>) => onChange(images.map((image, i) => (i === index ? { ...image, ...changes } : image)))
  const move = (index: number, by: -1 | 1) => {
    const next = [...images]
    const [moved] = next.splice(index, 1)
    if (moved) next.splice(index + by, 0, moved)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {images.map((image, index) => (
        <div key={index} className="flex flex-wrap items-center gap-3 rounded-lg bg-secondary p-2">
          {image.url ? <img src={image.url} alt="" className="size-14 rounded-md bg-tertiary object-cover" /> : <span className="size-14 rounded-md bg-tertiary" />}
          <input aria-label="Image URL" required placeholder="/images/products/…webp" value={image.url} onChange={(e) => update(index, { url: e.target.value })} className={`${controlClass} min-w-56 flex-[2]`} />
          <input aria-label="Alt text" placeholder="Describe the photo" value={image.altText} onChange={(e) => update(index, { altText: e.target.value })} className={`${controlClass} min-w-48 flex-[2]`} />
          <select aria-label="Role" value={image.role} onChange={(e) => update(index, { role: roles.find((role) => role === e.target.value) ?? 'gallery' })} className={`${controlClass} w-32`}>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <div className="flex">
            <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)} className="flex size-9 items-center justify-center rounded-lg text-tertiary hover:bg-tertiary disabled:opacity-30">
              <ArrowUp className="size-4" aria-hidden />
            </button>
            <button type="button" aria-label="Move down" disabled={index === images.length - 1} onClick={() => move(index, 1)} className="flex size-9 items-center justify-center rounded-lg text-tertiary hover:bg-tertiary disabled:opacity-30">
              <ArrowDown className="size-4" aria-hidden />
            </button>
            <button type="button" aria-label="Remove image" onClick={() => onChange(images.filter((_, i) => i !== index))} className="flex size-9 items-center justify-center rounded-lg text-tertiary hover:bg-error-primary hover:text-error-primary">
              <Trash01 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ))}
      <Button color="secondary" size="sm" iconLeading={Plus} onPress={() => onChange([...images, { url: '', altText: '', role: images.length === 0 ? 'primary' : 'gallery' }])}>
        Add photo
      </Button>
      <p className="text-xs text-tertiary">Site paths like /images/products/name.webp or full https URLs. Files are served as static assets, not stored in the database.</p>
    </div>
  )
}
