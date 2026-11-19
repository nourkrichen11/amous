'use client'

import type { TextFieldClientProps } from 'payload'
import type { ChangeEvent } from 'react'

import { TextInput } from '@payloadcms/ui'

import { slugify } from '@/features/catalogue/productIdentifiers'
import { useLiveFollowField } from './useLiveFollowField'

export function AdminSlugField({ field, path: pathFromProps }: TextFieldClientProps) {
  const { path, preview, setValue, showError, value } = useLiveFollowField({
    path: pathFromProps,
    sourcePath: 'name',
    transform: (name) => (typeof name === 'string' && name ? slugify(name) : '')
  })

  return (
    <div className="field-type amous-slug-field">
      <TextInput
        label={field.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
        path={path}
        placeholder={preview || 'genere-automatiquement'}
        showError={showError}
        value={value ?? ''}
      />
    </div>
  )
}
