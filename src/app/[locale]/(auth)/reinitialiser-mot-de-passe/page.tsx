import type { Metadata } from 'next'

import { AuthFooterLink } from '@/components/auth/AuthFields'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { ResetPasswordForm } from '@/components/auth/AuthForms'
import { EmptyState } from '@/components/ui/EmptyState'
import { isLocale } from '@/i18n/config'

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: { follow: false, index: false },
    title: 'Reinitialiser le mot de passe'
  }
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const query = await searchParams
  const token = typeof query.token === 'string' ? query.token : ''

  return (
    <AuthLayout
      footer={
        !token ? null : (
          <AuthFooterLink
            href={`/${locale}/connexion`}
            prefix="Vous vous souvenez de votre mot de passe ?"
            suffix="Retour à la connexion"
          />
        )
      }
      locale={locale}
      subtitle="Choisissez un nouveau mot de passe pour sécuriser votre compte."
      title="Créer un nouveau mot de passe"
    >
        {token ? (
          <ResetPasswordForm locale={locale} token={token} />
        ) : (
          <EmptyState actionHref={`/${locale}/mot-de-passe-oublie`} actionLabel="Demander un nouveau lien" title="Lien invalide" description="Le lien de reinitialisation est incomplet ou invalide." />
        )}
    </AuthLayout>
  )
}
