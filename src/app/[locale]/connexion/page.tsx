import type { Metadata } from 'next'

import { AuthFooterLink } from '@/components/auth/AuthFields'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/AuthForms'
import { getCurrentUser } from '@/features/auth/session'
import { isLocale } from '@/i18n/config'
import { redirect } from 'next/navigation'

type LoginPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: { follow: false, index: false },
    title: 'Connexion'
  }
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const query = await searchParams
  const returnTo = typeof query.returnTo === 'string' ? query.returnTo : undefined
  const status = typeof query.status === 'string' ? query.status : undefined
  const currentUser = await getCurrentUser()

  if (currentUser?.role === 'customer') {
    redirect(`/${locale}/mon-compte`)
  }

  return (
    <AuthLayout
      footer={
        <AuthFooterLink
          href={`/${locale}/inscription${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          prefix="Vous n’avez pas encore de compte ?"
          suffix="Créer un compte"
        />
      }
      locale={locale}
      subtitle="Connectez-vous pour accéder à votre compte et suivre vos commandes."
      title="Connexion"
    >
        {status === 'password-reset-success' ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.
          </div>
        ) : null}
        <LoginForm locale={locale} returnTo={returnTo} />
    </AuthLayout>
  )
}
