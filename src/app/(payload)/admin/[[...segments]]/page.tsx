import configPromise from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import type { ImportMap } from 'payload'

const importMap = {} as ImportMap

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: configPromise, params, searchParams })

export default function Page({ params, searchParams }: Args) {
  return RootPage({ config: configPromise, importMap, params, searchParams })
}
