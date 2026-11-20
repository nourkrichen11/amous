import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { ar } from '@payloadcms/translations/languages/ar'
import { fr } from '@payloadcms/translations/languages/fr'

import { Brands } from '@/collections/Brands'
import { Carts } from '@/collections/Carts'
import { Carriers } from '@/collections/Carriers'
import { Categories } from '@/collections/Categories'
import { CouponCodes } from '@/collections/CouponCodes'
import { AuditLogs } from '@/collections/AuditLogs'
import { DeliveryZones } from '@/collections/DeliveryZones'
import { HeroSlides } from '@/collections/HeroSlides'
import { Media } from '@/collections/Media'
import { OrderEvents } from '@/collections/OrderEvents'
import { Orders } from '@/collections/Orders'
import { Products } from '@/collections/Products'
import { Promotions } from '@/collections/Promotions'
import { Returns } from '@/collections/Returns'
import { Shipments } from '@/collections/Shipments'
import { StockMovements } from '@/collections/StockMovements'
import { Users } from '@/collections/Users'
import { DeliveryConfig } from '@/globals/DeliveryConfig'
import { HeaderGlobal } from '@/globals/Header'
import { Homepage } from '@/globals/Homepage'
import { SiteSettings } from '@/globals/SiteSettings'
import { getServerEnv } from '@/lib/env'

loadEnv({ path: '.env.local', quiet: true })
loadEnv({ quiet: true })

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const env = getServerEnv()

export default buildConfig({
  admin: {
    autoRefresh: true,
    dateFormat: 'dd/MM/yyyy HH:mm',
    theme: 'light',
    toast: {
      position: 'bottom-right'
    },
    user: Users.slug,
    components: {
      Nav: '@/components/payload/AdminNav#AdminNav',
      actions: ['@/components/payload/AdminTopbarTools#AdminTopbarTools'],
      beforeLogin: ['@/components/payload/AdminLoginBrand#AdminLoginBrand'],
      graphics: {
        Icon: '@/components/payload/AdminLoginBrand#AdminIcon',
        Logo: '@/components/payload/AdminLoginBrand#AdminLogo'
      },
      views: {
        dashboard: {
          Component: '@/components/payload/AdminDashboard#AdminDashboard'
        }
      }
    },
    meta: {
      titleSuffix: '- Administration AMOUS'
    }
  },
  collections: [Users, Media, Categories, Brands, Products, HeroSlides, Carts, Orders, OrderEvents, StockMovements, Returns, Promotions, CouponCodes, DeliveryZones, Carriers, Shipments, AuditLogs],
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: env.DATABASE_URI
    },
    // Dev-mode schema push (drizzle-kit) reconciles the live DB to match
    // ONLY Payload's own collection-derived schema — anything outside that
    // (the order_number_counters table and the products CHECK constraints
    // added by the 20260825 migration) gets silently dropped on the very
    // next `getPayload()` boot. Verified firsthand: both were wiped after a
    // single dev-mode init. Real migrations only take effect with push off.
    push: false
  }),
  editor: lexicalEditor(),
  globals: [HeaderGlobal, Homepage, SiteSettings, DeliveryConfig],
  // Payload's own UI chrome (search placeholders, "No results", "Create
  // New", pagination, filter labels...) defaults to English regardless of
  // the CONTENT `localization` below — that produced the mixed FR/EN admin
  // strings, not a missing CSS/copy override. Payload's official French
  // pack covers it, so the custom French components (AdminNav/
  // AdminDashboard/etc.) now match the framework's own chrome instead of
  // drifting from it. Arabic is registered too since content locales
  // include `ar`, but French stays the admin's own interface language.
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { ar, fr }
  },
  localization: {
    defaultLocale: 'fr',
    fallback: true,
    locales: [
      { code: 'fr', label: 'Français' },
      { code: 'ar', label: 'العربية', rtl: true }
    ]
  },
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true
      },
      token: env.BLOB_READ_WRITE_TOKEN
    })
  ],
  secret: env.PAYLOAD_SECRET,
  serverURL: env.NEXT_PUBLIC_SITE_URL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'types/payload-types.ts')
  }
})
