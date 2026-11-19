'use client'

import type { NumberFieldClientProps } from 'payload'
import type { ChangeEvent } from 'react'

import { TextInput, useField } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import { dinarsToMillimes, formatMoney } from '@/lib/money'

function toDisplayText(millimes: unknown): string {
  if (typeof millimes !== 'number' || Number.isNaN(millimes)) {
    return ''
  }

  return (millimes / 1000).toString().replace('.', ',')
}

/**
 * Products store prices as integer millimes (12500 = 12,500 DT) — this field
 * lets an admin type/read plain dinars while the underlying form value stays
 * in millimes, reusing the already-tested src/lib/money.ts conversions
 * instead of re-implementing them. Commits on blur (not per keystroke) so a
 * live reformat can't fight the user's cursor mid-edit.
 */
export function AdminMoneyField({ field, path: pathFromProps }: NumberFieldClientProps) {
  const { path, setValue, showError, value } = useField<number>({ path: pathFromProps })
  const [text, setText] = useState(() => toDisplayText(value))

  useEffect(() => {
    setText(toDisplayText(value))
  }, [value])

  const commit = () => {
    const millimes = dinarsToMillimes(text)
    setValue(millimes)
    setText(toDisplayText(millimes))
  }

  return (
    <div className="field-type amous-money-field" onBlur={commit}>
      <TextInput
        AfterInput={<span className="amous-money-field__suffix">DT</span>}
        label={field.label}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setText(event.target.value)}
        path={path}
        placeholder="0,000"
        showError={showError}
        value={text}
      />
      {typeof value === 'number' ? <p className="amous-money-field__preview">{formatMoney(value)}</p> : null}
    </div>
  )
}
