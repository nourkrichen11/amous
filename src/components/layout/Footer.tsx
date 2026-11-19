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
    <h2 className="flex items-center gap-2.5 text-base font-bold text-white" id={id}>
      <span aria-hidden="true" className="h-4 w-1 rounded-full bg-[var(--color-primary)]" />
      {children}
    </h2>
  )
}

function NavColumn({ links, title }: { links: FooterLink[]; title: string }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">{title}</h2>
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
    { href: `${home}#marques`, label: t(locale, 'navigation.brands') }
  ]
  const helpLinks: FooterLink[] = [
    { href: '#faq-livraison', label: t(locale, 'footer.delivery') },
    { href: '#faq-paiement', label: t(locale, 'footer.payment') },
    { href: '#faq-retours', label: t(locale, 'footer.returns') },
    { href: '#footer-contact', label: t(locale, 'navigation.contact') }
  ]
  const companyLinks: FooterLink[] = [
    { href: '#footer-store', label: 'Notre magasin' },
    { href: '#footer-contact', label: 'Horaires & contact' },
    { href: '#footer-faq', label: 'Questions fréquentes' },
    { href: `${home}/mon-compte`, label: t(locale, 'navigation.account') }
  ]

  return (
    <footer className="mt-12 bg-[var(--color-footer-bg)] text-white md:mt-16">
      <div aria-hidden="true" className="h-1 bg-[var(--color-primary)]" />

      {/* Section 1 — store, hours & contact, FAQ */}
      <div className="container-wide grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-12 lg:py-14">
        <section aria-labelledby="footer-store-title" className="scroll-mt-24" id="footer-store">
          <ColumnHeading id="footer-store-title">Le magasin</ColumnHeading>
          <address className={`mt-4 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-footer-line)] bg-white/[0.03] p-4 text-sm not-italic leading-relaxed ${mutedText}`}>
            <span aria-hidden="true" className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[var(--color-primary)]">
              <MapPin size={15} />
            </span>
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
        </section>

        <section aria-labelledby="footer-contact-title" className="scroll-mt-24" id="footer-contact">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ColumnHeading id="footer-contact-title">Horaires &amp; contact</ColumnHeading>
            {store.hasOpeningHours ? <StoreOpenStatus rules={store.openingRules} timeZone={store.timezone} /> : null}
          </div>

          <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-footer-line)] bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white">
              <Clock aria-hidden="true" className="text-[var(--color-primary)]" size={14} />
              Horaires d&apos;ouverture
            </p>
            {store.openingHours.length > 0 ? (
              <dl className="mt-3 grid gap-2 text-sm">
                {store.openingHours.map((row) => (
                  <div className="flex items-baseline justify-between gap-4 border-b border-[var(--color-footer-line)] pb-2 last:border-0 last:pb-0" key={row.label}>
                    <dt className="text-white">{row.label}</dt>
                    <dd className={`text-end tabular-nums ${row.closed ? 'text-[var(--color-footer-muted)]' : 'text-white/90'}`}>{row.hours}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={`mt-2 text-sm leading-relaxed ${mutedText}`}>Appelez-nous pour connaître nos horaires d&apos;ouverture avant de vous déplacer.</p>
            )}
          </div>

          <ul className="mt-5 grid gap-1">
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
        </section>

        <section aria-labelledby="footer-faq-title" className="scroll-mt-24 md:col-span-2 lg:col-span-1" id="footer-faq">
          <ColumnHeading id="footer-faq-title">Questions fréquentes</ColumnHeading>
          <div className="mt-4 divide-y divide-[var(--color-footer-line)] border-y border-[var(--color-footer-line)]">
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

      {/* Section 2 — navigation */}
      <div className="border-t border-[var(--color-footer-line)] bg-[var(--color-footer-deep)]">
        <div className="container-wide grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))] lg:gap-10">
          <div className="col-span-2 max-w-sm md:col-span-4 lg:col-span-1">
            <Link aria-label={`${store.legalName} — accueil`} className="relative inline-block h-[64px] w-[128px] overflow-hidden" href={home}>
              <Image alt="" className="object-cover" fill sizes="128px" src={logoUrl} unoptimized />
            </Link>
            <p className={`mt-3 text-sm leading-relaxed ${mutedText}`}>{store.description}</p>
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
          </div>
          <NavColumn links={shopLinks} title={t(locale, 'footer.shop')} />
          <NavColumn links={helpLinks} title={t(locale, 'footer.help')} />
          <div className="col-span-2 md:col-span-1">
            <NavColumn links={companyLinks} title="AMOUS" />
          </div>
        </div>
      </div>

      {/* Section 3 — legal */}
      <div className="border-t border-[var(--color-footer-line)] bg-[var(--color-footer-deep)]">
        <div className={`container-wide py-5 text-xs ${mutedText}`}>
          <p>
            © {year} {store.legalName}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
