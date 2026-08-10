import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'node:url'

import { Brands } from '@/collections/Brands'
import { Carts } from '@/collections/Carts'
import { Categories } from '@/collections/Categories'
import { HeroSlides } from '@/collections/HeroSlides'
import { Media } from '@/collections/Media'
import { Orders } from '@/collections/Orders'
import { Products } from '@/collections/Products'
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
    user: Users.slug,
    meta: {
      titleSuffix: '- Amous CMS'
    }
  },
  collections: [Users, Media, Categories, Brands, Products, HeroSlides, Carts, Orders],
  db: postgresAdapter({
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
