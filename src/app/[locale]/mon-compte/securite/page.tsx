import { AccountLayout } from '@/components/auth/AccountLayout'
import { ChangePasswordForm } from '@/components/auth/AuthForms'
import { requireCustomerUser } from '@/features/auth/session'
import { isLocale } from '@/i18n/config'

type AccountSecurityPageProps = {
  params: Promise<{ locale: string }>
}

export default async function AccountSecurityPage({ params }: AccountSecurityPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte/securite`)

  return (
    <AccountLayout currentPath={`/${locale}/mon-compte/securite`} locale={locale} user={user}>
      <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
        <h2 className="text-xl font-semibold">Securite</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Changez votre mot de passe et protegez l&apos;acces a votre compte.</p>
        <div className="mt-5">
          <ChangePasswordForm locale={locale} />
        </div>
      </div>
    </AccountLayout>
  )
}
