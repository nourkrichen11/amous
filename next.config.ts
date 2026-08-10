import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    useWasmBinary: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost'
      }
    ]
  }
}

export default withPayload(nextConfig)
