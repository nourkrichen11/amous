import { AccountLayout } from '@/components/auth/AccountLayout'
import { AddressForm } from '@/components/auth/AuthForms'
import { deleteAddressAction } from '@/features/auth/actions'
import { requireCustomerUser } from '@/features/auth/session'
import { isLocale } from '@/i18n/config'

type AccountAddressesPageProps = {
  params: Promise<{ locale: string }>
}

export default async function AccountAddressesPage({ params }: AccountAddressesPageProps) {
  const { locale: rawLocale } = await params
  const locale = isLocale(rawLocale) ? rawLocale : 'fr'
  const user = await requireCustomerUser(locale, `/${locale}/mon-compte/adresses`)

  return (
    <AccountLayout currentPath={`/${locale}/mon-compte/adresses`} locale={locale} user={user}>
      <div className="grid gap-6">
        {user.addresses.length > 0 ? (
          <div className="grid gap-4">
            {user.addresses.map((address, index) => (
              <div className="rounded-md border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-subtle)]" key={address.id || index}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{address.label || `Adresse ${index + 1}`}</h2>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {address.firstName} {address.lastName} - {address.phone}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                      {`, ${address.city}, ${address.governorate}`}
                    </p>
                  </div>
                  {address.isDefault ? (
                    <span className="rounded-full bg-[color:color-mix(in_srgb,var(--color-primary)_12%,white_88%)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                      Par defaut
                    </span>
                  ) : null}
                </div>
                <div className="mt-5">
                  <AddressForm address={address} locale={locale} title="Modifier l'adresse" />
                </div>
                {address.id ? (
                  <form action={deleteAddressAction} className="mt-4">
                    <input name="locale" type="hidden" value={locale} />
                    <input name="addressId" type="hidden" value={address.id} />
                    <button className="text-sm font-semibold text-[var(--color-error)]" type="submit">
                      Supprimer cette adresse
                    </button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <AddressForm locale={locale} title="Ajouter une adresse" />
      </div>
    </AccountLayout>
  )
}
