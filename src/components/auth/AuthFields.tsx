'use client'

import { CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { useId, useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

type IconName = 'email' | 'name' | 'password' | 'phone'

const iconMap = {
  email: Mail,
  name: User,
  password: LockKeyhole,
  phone: Phone
} satisfies Record<IconName, typeof Mail>

export function AuthAlert({
  message,
  tone = 'error'
}: {
  message?: string
  tone?: 'error' | 'info' | 'success'
}) {
  if (!message) {
    return null
  }

  const toneClass =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'info'
        ? 'border-[#DDE3EA] bg-[#F5F7FA] text-[#334155]'
        : 'border-red-200 bg-red-50 text-red-900'

  return (
    <div aria-live="polite" className={cn('rounded-2xl border px-4 py-3 text-sm leading-6', toneClass)} role="status">
      {message}
    </div>
  )
}

export function FieldError({ error, id }: { error?: string | string[]; id?: string }) {
  if (!error) {
    return null
  }

  return (
    <p aria-live="polite" className="text-sm text-[var(--color-error)]" id={id} role="status">
      {Array.isArray(error) ? error[0] : error}
    </p>
  )
}

export function FormField({
  autoComplete,
  defaultValue,
  error,
  icon,
  id,
  inputMode,
  label,
  name,
  onChange,
  placeholder,
  type = 'text'
}: {
  autoComplete?: string
  defaultValue?: string
  error?: string | string[]
  icon?: IconName
  id?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  label: string
  name: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
  type?: 'email' | 'tel' | 'text'
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const Icon = icon ? iconMap[icon] : null

  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-[#152033]" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        {Icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#7A8797]">
            <Icon size={18} />
          </span>
        ) : null}
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete={autoComplete}
          className={cn(
            'min-h-[48px] w-full rounded-2xl border bg-white px-4 text-sm text-[#152033] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition',
            Icon ? 'pl-11' : '',
            error
              ? 'border-red-300 focus:border-red-400'
              : 'border-[#DDE3EA] focus:border-[#0756C9] hover:border-[#BFC9D5]'
          )}
          defaultValue={defaultValue}
          id={inputId}
          inputMode={inputMode}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
        />
      </div>
      <FieldError error={error} id={error ? errorId : undefined} />
    </div>
  )
}

export function PasswordField({
  autoComplete,
  error,
  id,
  label,
  name,
  onChange,
  placeholder
}: {
  autoComplete?: string
  error?: string | string[]
  id?: string
  label: string
  name: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`
  const [visible, setVisible] = useState(false)

  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-[#152033]" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#7A8797]">
          <LockKeyhole size={18} />
        </span>
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete={autoComplete}
          className={cn(
            'min-h-[48px] w-full rounded-2xl border bg-white px-4 pl-11 pr-12 text-sm text-[#152033] shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition',
            error
              ? 'border-red-300 focus:border-red-400'
              : 'border-[#DDE3EA] focus:border-[#0756C9] hover:border-[#BFC9D5]'
          )}
          id={inputId}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={visible ? 'text' : 'password'}
        />
        <button
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute inset-y-0 right-1 inline-flex w-11 items-center justify-center rounded-xl text-[#526173] transition hover:text-[#152033]"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <FieldError error={error} id={error ? errorId : undefined} />
    </div>
  )
}

export function PasswordRequirements({ password }: { password: string }) {
  const checks = useMemo(
    () => [
      { label: 'Au moins 8 caractères', valid: password.length >= 8 },
      { label: 'Au moins une lettre', valid: /[A-Za-z]/.test(password) },
      { label: 'Au moins un chiffre', valid: /\d/.test(password) }
    ],
    [password]
  )

  return (
    <div className="rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] p-4">
      <p className="text-sm font-semibold text-[#152033]">Votre mot de passe doit contenir :</p>
      <ul className="mt-3 grid gap-2">
        {checks.map((check) => (
          <li
            className={cn('flex items-center gap-2 text-sm', check.valid ? 'text-emerald-700' : 'text-[#526173]')}
            key={check.label}
          >
            <CheckCircle2 size={16} />
            <span>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SubmitButton({ idleLabel, pendingLabel }: { idleLabel: string; pendingLabel: string }) {
  const { pending } = useFormStatus()

  return (
    <Button
      className="w-full rounded-2xl bg-[#E31E24] py-3 text-[15px] font-semibold text-white shadow-[0_14px_32px_rgba(227,30,36,0.24)] hover:bg-[#C81A20]"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
          />
          {pendingLabel}
        </span>
      ) : (
        idleLabel
      )}
    </Button>
  )
}

export function AuthFooterLink({
  href,
  prefix,
  suffix
}: {
  href: string
  prefix: string
  suffix: string
}) {
  return (
    <p className="text-sm leading-6 text-[#526173]">
      {prefix}{' '}
      <Link className="font-semibold text-[#0756C9] underline-offset-4 hover:underline" href={href}>
        {suffix}
      </Link>
    </p>
  )
}
