'use client'

import { CldUploadButton } from 'next-cloudinary'
import { Button } from '@/components/ui/button'

interface UploadButtonProps {
  onUpload: (result: any) => void
}

export function UploadButton({ onUpload }: UploadButtonProps) {
  return (
    <CldUploadButton uploadPreset="ml_default" onSuccess={onUpload}>
      <Button variant="outline">Upload New Avatar</Button>
    </CldUploadButton>
  )
}
