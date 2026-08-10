import type { Metadata } from 'next'

import { AuthFooterLink } from '@/components/auth/AuthFields'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { RegisterForm } from '@/components/auth/AuthForms'
import { getCurrentUser } from '@/features/auth/session'
import { isLocale } from '@/i18n/config'
import { redirect } from 'next/navigation'

type RegisterPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    robots: { follow: false, index: false },
    title: 'Creer un compte'
  }
}

export default async function RegisterPage({ params, searchParams }: RegisterPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const query = await searchParams
  const returnTo = typeof query.returnTo === 'string' ? query.returnTo : undefined
  const currentUser = await getCurrentUser()

  if (currentUser?.role === 'customer') {
    redirect(`/${locale}/mon-compte`)
  }

  return (
    <AuthLayout
      footer={
        <AuthFooterLink
          href={`/${locale}/connexion${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
          prefix="Vous avez déjà un compte ?"
          suffix="Se connecter"
        />
      }
      locale={locale}
      subtitle="Créez votre compte pour suivre vos commandes et enregistrer vos informations de livraison."
      title="Créer un compte"
    >
      <RegisterForm locale={locale} returnTo={returnTo} />
    </AuthLayout>
  )
}
