import type { MetadataRoute } from 'next'

import { getPublicSiteUrl } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPublicSiteUrl()

  return {
    rules: [
      {
        allow: '/',
        disallow: ['/api/', '/admin', '/fr/recherche', '/ar/recherche', '/fr/panier', '/ar/panier', '/fr/commande', '/ar/commande', '/fr/compte', '/ar/compte'],
        userAgent: '*'
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  }
}
