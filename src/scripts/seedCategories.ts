import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'
import { getPayload } from 'payload'

import { amousCategoryDefinitions } from '@/features/catalogue/categoryContent'

loadEnv({ path: '.env.local', quiet: true })
loadEnv({ quiet: true })

const categoryImagesDirectory = path.resolve('public/images/categories')
const amousCategoryIconsDirectory = path.resolve('media/amous-category-icons')
const placeholderImagePath = path.join(categoryImagesDirectory, 'category-placeholder.webp')

const amousCategoryIconFiles: Record<string, string> = {
  abrasifs: 'abrasive.webp',
  'ateliers-professionnels': 'ateliers-professionnels.webp',
  'boulonnerie-visserie': 'boulonnerie.webp',
  'coupe-et-percage': 'outils-de-coupe-et-percage.webp',
  electricite: 'electricite.webp',
  jardinage: 'jardinage.webp',
  maison: 'maison.webp',
  'manutention-et-levage': 'manutention-et-levage.webp',
  'materiel-equipement': 'materiels-d-equipement.webp',
  'mesure-et-controle': 'mesure-et-controle.webp',
  'outillage-a-main': 'outil-a-main.webp',
  'outillage-electroportatif': 'outil-electro-portatif.webp',
  peinture: 'peinture.webp',
  pneumatique: 'pneumatique.webp',
  'pompes-et-generateurs': 'pompes-et-generateurs.webp',
  'protection-et-securite': 'protection-et-securite.webp',
  quincaillerie: 'quincaillerie.webp',
  soudage: 'soudage-et-accessoires.webp',
  'tuyauterie-et-accessoires': 'tuyauterie-et-accessoires.webp'
}

type SeedStats = {
  created: number
  errors: number
  missingImages: number
  processed: number
  unchanged: number
  updated: number
}

type MediaRecord = {
  id: number | string
}

async function ensureCategoryPlaceholder() {
  await mkdir(categoryImagesDirectory, { recursive: true })

  if (existsSync(placeholderImagePath)) {
    return placeholderImagePath
  }

  const base = sharp({
    create: {
      background: '#F7FAFC',
      channels: 3,
      height: 900,
      width: 1200
    }
  })

  const svgOverlay = Buffer.from(`
    <svg width="1200" height="900" viewBox="0 0 1200 900" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="900" rx="36" fill="#F7FAFC"/>
      <rect x="110" y="120" width="980" height="660" rx="28" fill="#FFFFFF" stroke="#DCEAF6" stroke-width="8"/>
      <rect x="180" y="230" width="200" height="200" rx="24" fill="#DCEAF6"/>
      <rect x="420" y="210" width="240" height="240" rx="28" fill="#2F6DA4"/>
      <rect x="710" y="245" width="150" height="150" rx="20" fill="#1D4C80"/>
      <rect x="240" y="500" width="180" height="110" rx="18" fill="#2F6DA4"/>
      <rect x="460" y="505" width="340" height="95" rx="18" fill="#DCEAF6"/>
      <rect x="830" y="495" width="140" height="130" rx="18" fill="#1D4C80"/>
      <circle cx="955" cy="205" r="52" fill="#DCEAF6"/>
      <circle cx="270" cy="670" r="48" fill="#1D4C80"/>
      <circle cx="900" cy="660" r="40" fill="#2F6DA4"/>
    </svg>
  `)

  const output = await base.composite([{ input: svgOverlay }]).webp({ quality: 86 }).toBuffer()
  await writeFile(placeholderImagePath, output)

  return placeholderImagePath
}

async function upsertCategoryMedia({
  altText,
  filePath,
  payload,
  slug,
  source,
  usesPlaceholder
}: {
  altText: string
  filePath: string
  payload: Awaited<ReturnType<typeof getPayload>>
  slug: string
  source: 'amous-icon' | 'generated-image' | 'placeholder'
  usesPlaceholder: boolean
}): Promise<MediaRecord> {
  const metadataSource =
    source === 'amous-icon'
      ? `amous-category-icon:${slug}`
      : source === 'generated-image'
        ? `category-image:${slug}`
        : `category-placeholder:${slug}`
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    overrideAccess: true,
    where: {
      'metadata.source': {
        equals: metadataSource
      }
    }
  })

  const data = {
    altFr: altText,
    caption: usesPlaceholder ? 'Image de remplacement a remplacer par un visuel original Amous.' : undefined,
    metadata: {
      dominantColor: source === 'amous-icon' ? '#0057C8' : '#1D4C80',
      source: metadataSource
    }
  }

  if (existing.docs[0]) {
    await payload.update({
      collection: 'media',
      data,
      id: existing.docs[0].id,
      overrideAccess: true
    })

    return existing.docs[0] as MediaRecord
  }

  return (await payload.create({
    collection: 'media',
    data,
    filePath,
    overrideAccess: true
  })) as MediaRecord
}

async function upsertCategory({
  imageId,
  payload,
  slug
}: {
  imageId: number | string
  payload: Awaited<ReturnType<typeof getPayload>>
  slug: string
}) {
  const categoryDefinition = amousCategoryDefinitions.find((entry) => entry.slug === slug)

  if (!categoryDefinition) {
    throw new Error(`Categorie introuvable pour le slug ${slug}.`)
  }

  const existing = await payload.find({
    collection: 'categories',
    limit: 1,
    locale: 'fr',
    overrideAccess: true,
    where: {
      slug: {
        equals: categoryDefinition.slug
      }
    }
  })

  const data = {
    active: true,
    displayOrder: categoryDefinition.displayOrder,
    featured: categoryDefinition.featured,
    image: imageId,
    name: categoryDefinition.name,
    seo: {
      description: categoryDefinition.seoDescription,
      title: categoryDefinition.seoTitle,
      noIndex: false
    },
    description: categoryDefinition.shortDescription,
    showOnHomepage: categoryDefinition.showOnHomepage,
    slug: categoryDefinition.slug
  }

  if (!existing.docs[0]) {
    await payload.create({
      collection: 'categories',
      data,
      locale: 'fr',
      overrideAccess: true
    })

    return 'created' as const
  }

  const current = existing.docs[0] as Record<string, unknown>
  const hasChanged =
    current.name !== data.name ||
    current.slug !== data.slug ||
    current.description !== data.description ||
    current.displayOrder !== data.displayOrder ||
    current.featured !== data.featured ||
    current.showOnHomepage !== data.showOnHomepage ||
    current.active !== data.active ||
    current.image !== data.image

  if (!hasChanged) {
    return 'unchanged' as const
  }

  await payload.update({
    collection: 'categories',
    data,
    id: existing.docs[0].id,
    locale: 'fr',
    overrideAccess: true
  })

  return 'updated' as const
}

async function updateHomepageFeaturedCategories(payload: Awaited<ReturnType<typeof getPayload>>) {
  const featuredCategoryIds: Array<number | string> = []

  for (const definition of amousCategoryDefinitions) {
    if (!definition.showOnHomepage) {
      continue
    }

    const result = await payload.find({
      collection: 'categories',
      limit: 1,
      locale: 'fr',
      overrideAccess: true,
      where: {
        slug: {
          equals: definition.slug
        }
      }
    })

    const category = result.docs[0]
    if (category?.id) {
      featuredCategoryIds.push(category.id)
    }
  }

  if (featuredCategoryIds.length > 0) {
    try {
      await payload.updateGlobal({
        data: {
          featuredCategories: featuredCategoryIds
        },
        locale: 'fr',
        overrideAccess: true,
        slug: 'homepage'
      })
    } catch {
      console.warn('[categories] mise a jour des categories de la page d accueil ignoree: contenu homepage invalide.')
    }
  }
}

async function deactivateObsoleteParentCategories(payload: Awaited<ReturnType<typeof getPayload>>) {
  const expectedSlugs = new Set(amousCategoryDefinitions.map((definition) => definition.slug))
  const existingParents = await payload.find({
    collection: 'categories',
    limit: 200,
    locale: 'fr',
    overrideAccess: true,
    where: {
      and: [
        {
          active: {
            equals: true
          }
        },
        {
          or: [{ parent: { exists: false } }, { parent: { equals: null } }]
        }
      ]
    }
  })

  for (const category of existingParents.docs) {
    const slug = (category as { slug?: string }).slug

    if (!slug || expectedSlugs.has(slug)) {
      continue
    }

    await payload.update({
      collection: 'categories',
      data: {
        active: false
      },
      id: category.id,
      locale: 'fr',
      overrideAccess: true
    })

    console.log(`[categories] ${slug}: deactivated obsolete parent category`)
  }
}

async function seedCategories() {
  const { default: configPromise } = await import('@payload-config')
  const payload = await getPayload({ config: configPromise })
  const placeholderPath = await ensureCategoryPlaceholder()

  const stats: SeedStats = {
    created: 0,
    errors: 0,
    missingImages: 0,
    processed: 0,
    unchanged: 0,
    updated: 0
  }
  const missingImageSlugs: string[] = []

  for (const definition of amousCategoryDefinitions) {
    stats.processed += 1

    try {
      const iconFileName = amousCategoryIconFiles[definition.slug]
      const iconImagePath = iconFileName ? path.join(amousCategoryIconsDirectory, iconFileName) : undefined
      const generatedImagePath = path.join(categoryImagesDirectory, definition.imageFileName)
      const expectedImagePath = iconImagePath && existsSync(iconImagePath) ? iconImagePath : generatedImagePath
      const imageExists = existsSync(expectedImagePath)
      const filePath = imageExists ? expectedImagePath : placeholderPath
      const source = imageExists && iconImagePath && expectedImagePath === iconImagePath ? 'amous-icon' : imageExists ? 'generated-image' : 'placeholder'

      if (!imageExists) {
        stats.missingImages += 1
        missingImageSlugs.push(definition.slug)
        console.warn(`[categories] image manquante pour ${definition.slug}: ${definition.imageFileName}`)
      }

      const media = await upsertCategoryMedia({
        altText: definition.imageAlt,
        filePath,
        payload,
        slug: definition.slug,
        source,
        usesPlaceholder: !imageExists
      })

      const status = await upsertCategory({
        imageId: media.id,
        payload,
        slug: definition.slug
      })

      stats[status] += 1
      console.log(`[categories] ${definition.slug}: ${status}`)
    } catch (error) {
      stats.errors += 1
      console.error(`[categories] erreur pour ${definition.slug}`, error)
    }
  }

  await deactivateObsoleteParentCategories(payload)
  await updateHomepageFeaturedCategories(payload)

  console.log('\nRapport final categories')
  console.log(`- ${stats.processed} categories processed`)
  console.log(`- ${stats.created} created`)
  console.log(`- ${stats.updated} updated`)
  console.log(`- ${stats.unchanged} unchanged`)
  console.log(`- ${stats.missingImages} missing images`)
  console.log(`- ${stats.errors} errors`)

  if (missingImageSlugs.length > 0) {
    console.log(`- Images a remplacer: ${missingImageSlugs.join(', ')}`)
  }
}

seedCategories()
  .then(() => {
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
