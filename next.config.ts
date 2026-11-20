import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const isProduction = process.env.NODE_ENV === 'production'

// Conservative starter policy: `unsafe-inline`/`unsafe-eval` are kept as a
// safety margin for Next.js and Payload Admin's own inline styles/scripts —
// this has not been verified against a live browser session of /admin, so
// treat tightening it (removing the unsafe-* directives, adding nonces) as
// a follow-up that needs real browser testing, not something to assume works.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  // Google Maps embed for the store location in the footer.
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ')

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // HSTS only makes sense in production, over HTTPS — sending it in dev
  // (plain http://localhost) would tell browsers to force HTTPS locally too.
  ...(isProduction ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : [])
]

const nextConfig: NextConfig = {
  experimental: {
    useWasmBinary: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost'
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com'
      }
    ]
  },
  async redirects() {
    return [
      // Singular "marque" URLs → the localized brand directory / brand pages.
      { destination: '/fr/marques', permanent: true, source: '/marque' },
      { destination: '/:locale/marques', permanent: true, source: '/:locale(fr|ar)/marque' },
      { destination: '/:locale/marques/:brandSlug', permanent: true, source: '/:locale(fr|ar)/marque/:brandSlug' }
    ]
  },
  async headers() {
    return [
      {
        headers: securityHeaders,
        source: '/:path*'
      }
    ]
  }
}

export default withPayload(nextConfig)
