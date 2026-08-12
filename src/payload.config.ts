import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'node:url'

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
    }
  }),
  editor: lexicalEditor(),
  globals: [HeaderGlobal, Homepage, SiteSettings, DeliveryConfig],
  localization: {
    defaultLocale: 'fr',
    fallback: true,
    locales: [
      { code: 'fr', label: 'Français' },
      { code: 'ar', label: 'العربية', rtl: true }
    ]
  },
  secret: env.PAYLOAD_SECRET,
  serverURL: env.NEXT_PUBLIC_SITE_URL,
  sharp: undefined,
  typescript: {
    outputFile: path.resolve(dirname, 'types/payload-types.ts')
  }
})
