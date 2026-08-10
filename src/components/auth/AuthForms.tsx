'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import type { Locale } from '@/i18n/config'

import { changePasswordAction, forgotPasswordAction, loginAction, registerAction, resetPasswordAction, saveAddressAction, updateProfileAction, type AuthFormState } from '@/features/auth/actions'
import type { AddressInput, AuthUser } from '@/features/auth/types'
import { AuthAlert, FieldError, FormField, PasswordField, PasswordRequirements, SubmitButton } from './AuthFields'

export function LoginForm({ locale, returnTo }: { locale: Locale; returnTo?: string }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(loginAction, {})

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <input name="locale" type="hidden" value={locale} />
      <input name="returnTo" type="hidden" value={returnTo || ''} />
      <AuthAlert message={state.message} />

      <FormField autoComplete="email" error={state.fieldErrors?.email} icon="email" label="Adresse e-mail" name="email" type="email" />

      <PasswordField autoComplete="current-password" error={state.fieldErrors?.password} label="Mot de passe" name="password" />

      <div className="flex items-center justify-between gap-4">
        <label className="flex min-h-[44px] items-center gap-3 text-sm text-[#344255]">
          <input className="h-4 w-4 rounded border-[#C4CED8]" name="rememberMe" type="checkbox" />
          <span>Se souvenir de moi</span>
        </label>
        <Link
          className="text-sm font-medium text-[#0756C9] underline-offset-4 hover:underline"
          href={`/${locale}/mot-de-passe-oublie${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <SubmitButton idleLabel="Se connecter" pendingLabel="Connexion..." />

      <div className="rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] px-4 py-3 text-sm leading-6 text-[#526173]">
        Vos informations sont protégées et utilisées uniquement pour gérer votre compte et vos commandes.
      </div>
    </form>
  )
}

export function RegisterForm({ locale, returnTo }: { locale: Locale; returnTo?: string }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(registerAction, {})
  const [password, setPassword] = useState('')

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <input name="locale" type="hidden" value={locale} />
      <input name="returnTo" type="hidden" value={returnTo || ''} />
      <AuthAlert message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField error={state.fieldErrors?.firstName} icon="name" label="Prénom" name="firstName" />
        <FormField error={state.fieldErrors?.lastName} icon="name" label="Nom" name="lastName" />
      </div>

      <FormField autoComplete="email" error={state.fieldErrors?.email} icon="email" label="Adresse e-mail" name="email" type="email" />

      <FormField
        error={state.fieldErrors?.phone}
        icon="phone"
        inputMode="tel"
        label="Numéro de téléphone"
        name="phone"
        type="tel"
      />

      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        label="Mot de passe"
        name="password"
        onChange={(event) => setPassword(event.currentTarget.value)}
      />
      <PasswordRequirements password={password} />

      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors?.passwordConfirmation}
        label="Confirmer le mot de passe"
        name="passwordConfirmation"
      />

      <label className="flex items-start gap-3 rounded-2xl border border-[#DDE3EA] bg-[#F5F7FA] px-4 py-3 text-sm leading-6 text-[#344255]">
        <input className="mt-1 h-4 w-4 rounded border-[#C4CED8]" name="acceptTerms" type="checkbox" />
        <span>
          J’accepte les conditions générales et la politique de confidentialité.
        </span>
      </label>
      <FieldError error={state.fieldErrors?.acceptTerms} />

      <SubmitButton idleLabel="Créer mon compte" pendingLabel="Création..." />
    </form>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(forgotPasswordAction, {})

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <AuthAlert message={state.message} tone={state.ok ? 'success' : 'error'} />
      <FormField autoComplete="email" error={state.fieldErrors?.email} icon="email" label="Adresse e-mail" name="email" type="email" />
      <SubmitButton idleLabel="Envoyer le lien" pendingLabel="Envoi..." />
    </form>
  )
}

export function ResetPasswordForm({ locale, token }: { locale: Locale; token: string }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(resetPasswordAction, {})
  const [password, setPassword] = useState('')

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <input name="locale" type="hidden" value={locale} />
      <input name="token" type="hidden" value={token} />
      <AuthAlert message={state.message} />
      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        label="Nouveau mot de passe"
        name="password"
        onChange={(event) => setPassword(event.currentTarget.value)}
      />
      <PasswordRequirements password={password} />
      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors?.passwordConfirmation}
        label="Confirmer le mot de passe"
        name="passwordConfirmation"
      />
      <SubmitButton idleLabel="Réinitialiser le mot de passe" pendingLabel="Réinitialisation..." />
    </form>
  )
}

export function ProfileForm({ locale, user }: { locale: Locale; user: AuthUser }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(updateProfileAction, {})

  return (
    <form action={formAction} className="grid gap-4">
      <input name="locale" type="hidden" value={locale} />
      <AuthAlert message={state.message} tone={state.ok ? 'success' : 'error'} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField defaultValue={user.firstName} error={state.fieldErrors?.firstName} icon="name" label="Prénom" name="firstName" />
        <FormField defaultValue={user.lastName} error={state.fieldErrors?.lastName} icon="name" label="Nom" name="lastName" />
      </div>
      <FormField defaultValue={user.email} error={state.fieldErrors?.email} icon="email" label="Adresse e-mail" name="email" type="email" />
      <FormField defaultValue={user.phone || ''} error={state.fieldErrors?.phone} icon="phone" label="Téléphone" name="phone" type="tel" />
      <SubmitButton idleLabel="Enregistrer" pendingLabel="Enregistrement..." />
    </form>
  )
}

export function ChangePasswordForm({ locale }: { locale: Locale }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(changePasswordAction, {})
  const [password, setPassword] = useState('')

  return (
    <form action={formAction} className="grid gap-4">
      <input name="locale" type="hidden" value={locale} />
      <AuthAlert message={state.message} tone={state.ok ? 'success' : 'error'} />
      <PasswordField autoComplete="current-password" error={state.fieldErrors?.currentPassword} label="Mot de passe actuel" name="currentPassword" />
      <PasswordField
        autoComplete="new-password"
        error={state.fieldErrors?.newPassword}
        label="Nouveau mot de passe"
        name="newPassword"
        onChange={(event) => setPassword(event.currentTarget.value)}
      />
      <PasswordRequirements password={password} />
      <PasswordField autoComplete="new-password" error={state.fieldErrors?.confirmNewPassword} label="Confirmation du nouveau mot de passe" name="confirmNewPassword" />
      <SubmitButton idleLabel="Mettre a jour le mot de passe" pendingLabel="Mise a jour..." />
    </form>
  )
}

export function AddressForm({
  address,
  locale,
  title
}: {
  address?: AddressInput
  locale: Locale
  title: string
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(saveAddressAction, {})

  return (
    <form action={formAction} className="grid gap-4 rounded-md border border-[var(--color-border)] bg-white p-5">
      <input name="locale" type="hidden" value={locale} />
      <input name="addressId" type="hidden" value={address?.id || ''} />
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <AuthAlert message={state.message} tone={state.ok ? 'success' : 'error'} />
      <FormField defaultValue={address?.label || ''} label="Libelle" name="label" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField defaultValue={address?.firstName || ''} label="Prenom" name="firstName" />
        <FormField defaultValue={address?.lastName || ''} label="Nom" name="lastName" />
      </div>
      <FormField defaultValue={address?.phone || ''} label="Telephone" name="phone" />
      <FormField defaultValue={address?.addressLine1 || ''} label="Adresse" name="addressLine1" />
      <FormField defaultValue={address?.addressLine2 || ''} label="Complement d'adresse" name="addressLine2" />
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField defaultValue={address?.city || ''} label="Ville" name="city" />
        <FormField defaultValue={address?.governorate || ''} label="Gouvernorat" name="governorate" />
        <FormField defaultValue={address?.postalCode || ''} label="Code postal" name="postalCode" />
      </div>
      <label className="flex min-h-[44px] items-center gap-2 text-sm">
        <input defaultChecked={address?.isDefault} name="isDefault" type="checkbox" />
        <span>Definir comme adresse par defaut</span>
      </label>
      <SubmitButton idleLabel="Enregistrer l'adresse" pendingLabel="Enregistrement..." />
    </form>
  )
}
