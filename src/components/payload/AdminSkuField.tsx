'use client'

import type { TextFieldClientProps } from 'payload'
import type { ChangeEvent } from 'react'

import { TextInput } from '@payloadcms/ui'

import { skuCode } from '@/features/catalogue/productIdentifiers'
import { useLiveFollowField } from './useLiveFollowField'

/**
 * Unlike the slug, the real SKU needs a DB-backed collision check (see
 * generateUniqueSku in productIdentifiers.ts) — not something a client
 * component can safely do live. This shows the deterministic AM-<code>-
 * prefix as an honest preview; the exact sequence number is only known once
 * the beforeValidate hook actually runs on save.
 */
export function AdminSkuField({ field, path: pathFromProps }: TextFieldClientProps) {
  const { path, preview, setValue, showError, value } = useLiveFollowField({
    path: pathFromProps,
    sourcePath: 'name',
    transform: (name) => (typeof name === 'string' && name ? `AM-${skuCode(name)}-...` : '')
  })

  return (
    <div className="field-type amous-sku-field">
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
