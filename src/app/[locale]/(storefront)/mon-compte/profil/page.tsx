import { AccountLayout } from '@/components/auth/AccountLayout'
import { ProfileForm } from '@/components/auth/AuthForms'
import { requireCustomerUser } from '@/features/auth/session'
import { isLocale } from '@/i18n/config'

type AccountProfilePageProps = {
  params: Promise<{ locale: string }>
}

export default async function AccountProfilePage({ params }: AccountProfilePageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte/profil`)

  return (
    <AccountLayout currentPath={`/${locale}/mon-compte/profil`} locale={locale} user={user}>
      <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]">
        <h2 className="text-xl font-semibold">Profil</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Mettez a jour vos informations personnelles et votre numero de contact.</p>
        <div className="mt-5">
          <ProfileForm locale={locale} user={user} />
        </div>
      </div>
    </AccountLayout>
  )
}
