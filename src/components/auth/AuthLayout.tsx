import Image from 'next/image'
import type { ReactNode } from 'react'

import type { Locale } from '@/i18n/config'

import { AuthBrandPanel } from './AuthBrandPanel'

type AuthLayoutProps = {
  children: ReactNode
  footer?: ReactNode
  locale: Locale
  subtitle: string
  title: string
}

export function AuthLayout({ children, footer, locale, subtitle, title }: AuthLayoutProps) {
  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:pb-8 lg:pt-10" id="main-content">
      <div className="mx-auto max-w-[1220px]">
        <div className="overflow-hidden rounded-[20px] border border-[#DDE3EA] bg-white shadow-[0_26px_70px_rgba(21,32,51,0.08)]">
          <div className="grid lg:min-h-[min(620px,calc(100vh-220px))] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
            <AuthBrandPanel />

            <section className="flex flex-col justify-center bg-white px-5 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-8 2xl:px-12 2xl:py-10">
              <div className="mx-auto w-full max-w-[500px]">
                <div className="mb-6 flex justify-center lg:hidden">
                  <Image alt="Logo Amous" height={44} priority src="/logo2.png" width={116} />
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0756C9]">
                    {locale === 'fr' ? 'Espace client' : 'مساحة العميل'}
                  </p>
                  <h1 className="text-[28px] font-semibold leading-tight text-[#152033] sm:text-[30px]">{title}</h1>
                  <p className="text-sm leading-6 text-[#526173]">{subtitle}</p>
                </div>

                <div className="mt-6">{children}</div>

                {footer ? <div className="mt-5">{footer}</div> : null}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
