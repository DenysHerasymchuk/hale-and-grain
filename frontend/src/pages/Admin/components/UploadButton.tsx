import { UploadCloud02 } from '@untitledui/icons'
import { useRef, useState } from 'react'
import { Button } from '@/components/base/buttons/button'
import type { UploadResult } from '@/features/admin/api'
import { ApiError } from '@/lib/apiClient'

interface UploadButtonProps {
  label: string
  accept: string
  multiple?: boolean
  upload: (file: File) => Promise<UploadResult>
  onUploaded: (results: UploadResult[]) => void
}

export function UploadButton({ label, accept, multiple = false, upload, onUploaded }: UploadButtonProps) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    setError(null)
    try {
      const results: UploadResult[] = []
      for (const file of files) results.push(await upload(file))
      onUploaded(results)
    } catch (e) {
      setError(e instanceof ApiError ? e.messages.join(' ') : 'Upload failed.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => void pick(e.target.files)} />
      <Button type="button" color="secondary" size="sm" iconLeading={UploadCloud02} isLoading={busy} onPress={() => input.current?.click()}>
        {label}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-error-primary">
          {error}
        </p>
      )}
    </div>
  )
}
