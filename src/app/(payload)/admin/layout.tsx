import configPromise from '@payload-config'
import { rtlLanguages } from '@payloadcms/translations'
import { ProgressBar, RootProvider } from '@payloadcms/ui'
import { getClientConfig } from '@payloadcms/ui/utilities/getClientConfig'
import { cookies as nextCookies } from 'next/headers'
import type { ReactNode } from 'react'
import type { SanitizedPermissions } from 'payload'
import { applyLocaleFiltering } from 'payload/shared'

import { handleServerFunctions } from '@payloadcms/next/layouts'
import { getNavPrefs } from '../../../../node_modules/@payloadcms/next/dist/elements/Nav/getNavPrefs.js'
import { NestProviders } from '../../../../node_modules/@payloadcms/next/dist/layouts/Root/NestProviders.js'
import { getRequestTheme } from '../../../../node_modules/@payloadcms/next/dist/utilities/getRequestTheme.js'
import { initReq } from '../../../../node_modules/@payloadcms/next/dist/utilities/initReq.js'

import { importMap } from './importMap.js'

type PayloadAdminLayoutProps = {
  children: ReactNode
}

type AdminLanguageOption = {
  label: string
  value: string
}

export default async function PayloadAdminLayout({ children }: PayloadAdminLayoutProps) {
  const {
    cookies,
    headers,
    languageCode,
    permissions,
    req,
    req: {
      payload: { config }
    }
  } = await initReq({
    configPromise,
    importMap,
    key: 'RootLayout'
  })

  const theme = getRequestTheme({
    config,
    cookies,
    headers
  })

  const languageOptions = Object.entries(config.i18n.supportedLanguages || {}).reduce<AdminLanguageOption[]>((acc, [language, languageConfig]) => {
    if (Object.keys(config.i18n.supportedLanguages).includes(language)) {
      acc.push({
        label: (languageConfig as { translations: { general: { thisLanguage: string } } }).translations.general.thisLanguage,
        value: language
      })
    }

    return acc
  }, [])

  async function switchLanguageServerAction(lang: string) {
    'use server'

    const cookieStore = await nextCookies()
    cookieStore.set({
      name: `${config.cookiePrefix || 'payload'}-lng`,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      value: lang
    })
  }

  async function serverFunction(args: { args: Record<string, unknown>; name: string }) {
    'use server'

    return handleServerFunctions({
      ...args,
      config: configPromise,
      importMap
    })
  }

  const navPrefs = await getNavPrefs(req)
  const clientConfig = getClientConfig({
    config,
    i18n: req.i18n,
    importMap,
    user: req.user as never
  })

  await applyLocaleFiltering({
    clientConfig,
    config,
    req
  })

  return (
    <RootProvider
      config={clientConfig}
      dateFNSKey={req.i18n.dateFNSKey}
      fallbackLang={config.i18n.fallbackLanguage}
      isNavOpen={navPrefs?.open ?? true}
      languageCode={languageCode}
      languageOptions={languageOptions as never}
      locale={req.locale ?? undefined}
      permissions={(permissions ?? {}) as SanitizedPermissions}
      serverFunction={serverFunction}
      switchLanguageServerAction={switchLanguageServerAction}
      theme={theme}
      translations={req.i18n.translations}
      user={req.user}
    >
      <ProgressBar />
      {Array.isArray(config.admin?.components?.providers) && config.admin.components.providers.length > 0 ? (
        <NestProviders
          importMap={req.payload.importMap}
          providers={config.admin.components.providers}
          serverProps={{
            i18n: req.i18n,
            payload: req.payload,
            permissions,
            user: req.user ?? undefined
          }}
        >
          {children}
        </NestProviders>
      ) : (
        children
      )}
      <div dir={rtlLanguages.includes(languageCode as (typeof rtlLanguages)[number]) ? 'rtl' : 'ltr'} id="portal" />
    </RootProvider>
  )
}
