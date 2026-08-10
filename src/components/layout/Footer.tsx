import Link from 'next/link'

import type { CategoryItem, SiteSettingsData } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'

type FooterProps = {
  categories: CategoryItem[]
  locale: Locale
  settings: SiteSettingsData
}

export function Footer({ categories, locale, settings }: FooterProps) {
  const copyrightText = settings.copyrightText?.replace('Â©', '©')

  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-base font-semibold">{t(locale, 'footer.shop')}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href={`/${locale}/boutique`}>{t(locale, 'navigation.shop')}</Link>
            </li>
            {categories.slice(0, 5).map((category) => (
              <li key={String(category.id)}>
                <Link href={`/${locale}/c/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">{t(locale, 'footer.help')}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href={`/${locale}/recherche?q=livraison`}>{t(locale, 'footer.delivery')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/recherche?q=paiement`}>{t(locale, 'footer.payment')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/recherche?q=retours`}>{t(locale, 'footer.returns')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/recherche?q=contact`}>{t(locale, 'navigation.contact')}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">{t(locale, 'footer.company')}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--color-text-muted)]">
            <li>
              <Link href={`/${locale}/recherche?q=amous`}>{t(locale, 'footer.company')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/recherche?q=magasins`}>{t(locale, 'footer.stores')}</Link>
            </li>
            <li>
              <Link href={`/${locale}/recherche?q=services`}>{t(locale, 'footer.services')}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-semibold">{t(locale, 'home.contact')}</h2>
          <address className="mt-3 grid gap-2 text-sm not-italic text-[var(--color-text-muted)]">
            {settings.phone ? <a href={`tel:${settings.phone}`}>{settings.phone}</a> : null}
            {settings.whatsappNumber ? <a href={`https://wa.me/${settings.whatsappNumber}`}>WhatsApp</a> : null}
            {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : null}
            {settings.address ? <span>{settings.address}</span> : null}
          </address>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] py-4 text-center text-sm text-[var(--color-text-muted)]">
        {copyrightText || `© ${new Date().getFullYear()} Amous`}
      </div>
    </footer>
  )
}
