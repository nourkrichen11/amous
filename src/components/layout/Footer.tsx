import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Clock, ExternalLink, Mail, MapPin, MessageCircle, MessageCircleQuestion, Navigation, Phone } from 'lucide-react'
import type { ReactNode } from 'react'

import { StoreOpenStatus } from '@/components/layout/footer/StoreOpenStatus'
import type { DeliveryConfigView } from '@/features/cart/types'
import type { SiteSettingsData } from '@/features/catalogue/types'
import { buildFooterFaq } from '@/features/store/faq'
import { getStoreProfile } from '@/features/store/profile'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'

type FooterProps = {
  delivery: DeliveryConfigView
  locale: Locale
  logoUrl?: string
  settings: SiteSettingsData
}

type FooterLink = { href: string; label: string }

const mutedText = 'text-[var(--color-footer-muted)]'
const navLinkClass = `inline-flex min-h-9 items-center text-sm ${mutedText} transition-colors hover:text-white focus-visible:text-white`

function ColumnHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 className="text-sm font-bold text-white" id={id}>
      {children}
    </h2>
  )
}

function NavColumn({ links, title }: { links: FooterLink[]; title: string }) {
  return (
    <nav aria-label={title}>
      <ColumnHeading>{title}</ColumnHeading>
      <ul className="mt-3 grid">
        {links.map((link) => (
          <li key={link.href}>
            <Link className={navLinkClass} href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Footer({ delivery, locale, logoUrl = '/logo2.jpg', settings }: FooterProps) {
  const store = getStoreProfile(settings)
  const faq = buildFooterFaq(delivery)
  const year = new Date().getFullYear()
  const primaryPhone = store.phones[0]
  const askHref = store.whatsappNumber ? `https://wa.me/${store.whatsappNumber}` : primaryPhone?.href
  const askLabel = store.whatsappNumber ? 'Poser une question sur WhatsApp' : primaryPhone ? `Poser une question par téléphone au ${primaryPhone.display}` : undefined
  const home = `/${locale}`

  const shopLinks: FooterLink[] = [
    { href: `${home}/boutique`, label: 'Tous les produits' },
    { href: `${home}/nos-categories`, label: t(locale, 'navigation.categories') },
    { href: `${home}/boutique?promotion=1`, label: 'Offres' },
    { href: `${home}/marques`, label: t(locale, 'navigation.brands') }
  ]
  const helpLinks: FooterLink[] = [
    { href: '#faq-livraison', label: t(locale, 'footer.delivery') },
    { href: '#faq-paiement', label: t(locale, 'footer.payment') },
    { href: '#faq-retours', label: t(locale, 'footer.returns') },
    { href: '#footer-contact', label: t(locale, 'navigation.contact') },
    { href: '#footer-store', label: 'Notre magasin' },
    { href: '#footer-faq', label: 'Questions fréquentes' },
    { href: `${home}/mon-compte`, label: t(locale, 'navigation.account') }
  ]

  return (
    <footer className="mt-12 border-t-4 border-[var(--color-primary)] bg-[var(--color-footer-bg)] text-white md:mt-16">
      <div className="container-wide grid gap-x-8 gap-y-9 py-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1.4fr)] lg:py-12 xl:gap-x-10">
        <section aria-labelledby="footer-store-title" className="scroll-mt-24" id="footer-store">
          <h2 className="sr-only" id="footer-store-title">Le magasin</h2>
          <Link aria-label={`${store.legalName} — accueil`} className="relative inline-block h-[64px] w-[128px] overflow-hidden rounded-[var(--radius-sm)] align-top" href={home}>
            <Image alt="" className="object-cover" fill sizes="128px" src={logoUrl} unoptimized />
          </Link>
          <p className={`mt-4 max-w-xs text-sm leading-relaxed ${mutedText}`}>{store.description}</p>
          <address className={`mt-4 flex items-start gap-2.5 text-sm not-italic leading-relaxed ${mutedText}`}>
            <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--color-primary)]" size={16} />
            <span>
              <span className="font-semibold text-white">{store.legalName}</span>
              {store.addressLines.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </span>
          </address>
          {store.mapEmbedUrl ? (
            <div className="mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-footer-line)] bg-[var(--color-footer-deep)]">
              <iframe
                className="block aspect-[16/10] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={store.mapEmbedUrl}
                title={`Carte : emplacement de ${store.legalName}, ${store.addressLines.join(', ')}`}
              />
            </div>
          ) : null}
          {store.directionsUrl ? (
            <a
              className="mt-4 inline-flex min-h-[var(--touch-target)] items-center gap-2 rounded-[var(--radius-md)] border border-white/15 px-4 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
              href={store.directionsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Navigation aria-hidden="true" size={16} />
              Itinéraire
              <span className="sr-only"> (ouvre Google Maps dans un nouvel onglet)</span>
              <ExternalLink aria-hidden="true" className="opacity-60" size={14} />
            </a>
          ) : null}
          {store.socialLinks.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Réseaux sociaux">
              {store.socialLinks.map((link) => (
                <li key={link.url}>
                  <a
                    className="inline-flex min-h-9 items-center rounded-full border border-white/15 px-3 text-xs font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5"
                    href={link.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section aria-labelledby="footer-contact-title" className="scroll-mt-24" id="footer-contact">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ColumnHeading id="footer-contact-title">Horaires &amp; contact</ColumnHeading>
            {store.hasOpeningHours ? <StoreOpenStatus rules={store.openingRules} timeZone={store.timezone} /> : null}
          </div>

          <ul className="mt-3 grid gap-1">
            {store.phones.map((phone) => (
              <li key={phone.href}>
                <a aria-label={`Appeler le ${phone.display}`} className="group inline-flex min-h-10 items-center gap-3 text-[15px] font-semibold text-white" href={phone.href}>
                  <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                    <Phone size={15} />
                  </span>
                  <span className="tabular-nums" dir="ltr">
                    {phone.display}
                  </span>
                </a>
              </li>
            ))}
            {store.whatsappNumber ? (
              <li>
                <a className="group inline-flex min-h-10 items-center gap-3 text-sm font-semibold text-white" href={`https://wa.me/${store.whatsappNumber}`} rel="noopener noreferrer" target="_blank">
                  <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <MessageCircle size={15} />
                  </span>
                  WhatsApp
                </a>
              </li>
            ) : null}
            {store.email ? (
              <li>
                <a className="group inline-flex min-h-10 items-center gap-3 break-all text-sm font-semibold text-white" href={`mailto:${store.email}`}>
                  <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
                    <Mail size={15} />
                  </span>
                  {store.email}
                </a>
              </li>
            ) : null}
          </ul>

          <div className="mt-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock aria-hidden="true" className="text-[var(--color-primary)]" size={14} />
              Horaires d&apos;ouverture
            </p>
            {store.openingHours.length > 0 ? (
              <dl className="mt-3 grid gap-2 text-sm">
                {store.openingHours.map((row) => (
                  <div className="flex items-baseline justify-between gap-4 border-b border-[var(--color-footer-line)] pb-2 last:border-0 last:pb-0" key={row.label}>
                    <dt className="text-white">{row.label}</dt>
                    <dd className={`text-end tabular-nums ${row.closed ? mutedText : 'text-white/90'}`}>{row.hours}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={`mt-2 max-w-xs text-sm leading-relaxed ${mutedText}`}>Appelez-nous pour connaître nos horaires d&apos;ouverture avant de vous déplacer.</p>
            )}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-x-4">
          <NavColumn links={shopLinks} title={t(locale, 'footer.shop')} />
          <NavColumn links={helpLinks} title={t(locale, 'footer.help')} />
        </div>

        <section aria-labelledby="footer-faq-title" className="scroll-mt-24" id="footer-faq">
          <ColumnHeading id="footer-faq-title">Questions fréquentes</ColumnHeading>
          <div className="mt-2 divide-y divide-[var(--color-footer-line)] border-b border-[var(--color-footer-line)]">
            {faq.map((item) => (
              <details className="group scroll-mt-24" id={item.id} key={item.id} name="footer-faq">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-white transition-colors hover:text-white/80 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown aria-hidden="true" className="shrink-0 text-[var(--color-footer-muted)] transition-transform duration-200 group-open:rotate-180" size={18} />
                </summary>
                <div className={`grid gap-2 pb-4 pe-6 text-sm leading-relaxed ${mutedText}`}>
                  {item.answer.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
          {askHref && askLabel ? (
            <a
              aria-label={askLabel}
              className="mt-5 inline-flex min-h-[var(--touch-target)] w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 text-sm font-bold text-white transition-colors hover:bg-[#c70511] sm:w-auto"
              href={askHref}
              {...(store.whatsappNumber ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
            >
              <MessageCircleQuestion aria-hidden="true" size={18} />
              Poser une question
            </a>
          ) : null}
        </section>
      </div>

      <p className={`container-wide border-t border-[var(--color-footer-line)] py-5 text-xs ${mutedText}`}>
        © {year} {store.legalName}. Tous droits réservés.
      </p>
    </footer>
  )
}
