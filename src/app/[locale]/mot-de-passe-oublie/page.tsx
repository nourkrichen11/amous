import type { Metadata } from 'next'

import { AuthFooterLink } from '@/components/auth/AuthFields'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ForgotPasswordForm } from '@/components/auth/AuthForms'
import { isLocale } from '@/i18n/config'

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: { follow: false, index: false },
    title: 'Mot de passe oublie'
  }
}

export default async function ForgotPasswordPage({ params, searchParams }: ForgotPasswordPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const query = await searchParams
  const returnTo = typeof query.returnTo === 'string' ? query.returnTo : undefined

  return (
    <AuthLayout
      footer={
        <AuthFooterLink
          href={`/${locale}/connexion${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          prefix="Vous vous souvenez de votre mot de passe ?"
          suffix="Retour à la connexion"
        />
      }
      locale={locale}
      subtitle="Entrez votre adresse e-mail. Nous vous enverrons un lien pour réinitialiser votre mot de passe."
      title="Mot de passe oublié ?"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
