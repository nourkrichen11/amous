'use client'

import { useField, useFormFields } from '@payloadcms/ui'

type LiveFollowFieldOptions = {
  path: string
  sourcePath: string
  transform: (value: unknown) => string
}

export function useLiveFollowField({ path, sourcePath, transform }: LiveFollowFieldOptions) {
  const field = useField<string>({ path })
  const sourceValue = useFormFields(([fields]) => fields[sourcePath]?.value)

  return { ...field, preview: transform(sourceValue) }
}
