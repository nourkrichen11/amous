import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { getPayload } from 'payload'

loadEnv({ path: '.env.local', quiet: true })
loadEnv({ quiet: true })

type SeedCategory = {
  ar: {
    description: string
    name: string
    slug: string
  }
  featured?: boolean
  fr: {
    description: string
    name: string
    slug: string
  }
  order: number
}

type SeedBrand = {
  descriptionAr: string
  descriptionFr: string
  featured?: boolean
  name: string
  slug: string
}

type SeedProduct = {
  attributes?: Array<{
    labelAr: string
    labelFr: string
    unit?: string
    valueAr: string
    valueFr: string
  }>
  brand: string
  category: string
  featured?: boolean
  fullAr: string
  fullFr: string
  nameAr: string
  nameFr: string
  newProduct?: boolean
  previousPrice?: number
  price: number
  promotionalProduct?: boolean
  shortAr: string
  shortFr: string
  sku: string
  slug: string
  stockQuantity: number
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock'
  unit: 'piece' | 'box' | 'metre' | 'litre' | 'kilogram' | 'pack'
  minimumOrderQuantity?: number
  quantityIncrement?: number
}

type SeedMediaAsset = {
  altAr: string
  altFr: string
  filePath: string
  source: string
}

type SeedHeaderNavItem = {
  isCategoryTrigger?: boolean
  label: string
  url: string
}

const categories: SeedCategory[] = [
  {
    ar: { description: 'أدوات يدوية للأعمال اليومية والإصلاحات.', name: 'الأدوات اليدوية', slug: 'adawat-yadawiya' },
    featured: true,
    fr: { description: 'Outils à main pour les réparations et travaux quotidiens.', name: 'Outillage à main', slug: 'outillage-a-main' },
    order: 10
  },
  {
    ar: { description: 'معدات كهربائية للثقب والقطع والصقل.', name: 'الأدوات الكهربائية', slug: 'outillage-electroportatif' },
    featured: true,
    fr: { description: 'Machines électroportatives pour percer, couper et poncer.', name: 'Outillage électroportatif', slug: 'outillage-electroportatif' },
    order: 20
  },
  {
    ar: { description: 'دهانات وتحضيرات للأسطح الداخلية والخارجية.', name: 'الدهان', slug: 'peinture' },
    featured: true,
    fr: { description: 'Peintures et préparations pour surfaces intérieures et extérieures.', name: 'Peinture', slug: 'peinture' },
    order: 30
  },
  {
    ar: { description: 'معدات السباكة والصيانة.', name: 'السباكة', slug: 'plomberie' },
    featured: true,
    fr: { description: 'Équipements de plomberie, raccords et maintenance.', name: 'Plomberie', slug: 'plomberie' },
    order: 40
  },
  {
    ar: { description: 'مستلزمات الكهرباء والإضاءة والتركيب.', name: 'الكهرباء', slug: 'electricite' },
    featured: true,
    fr: { description: 'Matériel électrique, éclairage et installation.', name: 'Électricité', slug: 'electricite' },
    order: 50
  },
  {
    ar: { description: 'براغي ومثبتات للأخشاب والمعادن والبناء.', name: 'البراغي والتثبيت', slug: 'visserie-fixation' },
    featured: true,
    fr: { description: 'Vis, chevilles et fixations pour bois, métal et construction.', name: 'Visserie et fixation', slug: 'visserie-et-fixation' },
    order: 60
  }
]

const brands: SeedBrand[] = [
  { descriptionAr: 'أدوات موثوقة للأعمال اليومية.', descriptionFr: 'Outils fiables pour les travaux quotidiens.', featured: true, name: 'Bosch', slug: 'bosch' },
  { descriptionAr: 'حلول عملية للورش والمنازل.', descriptionFr: 'Solutions pratiques pour ateliers et maisons.', featured: true, name: 'Stanley', slug: 'stanley' },
  { descriptionAr: 'دهانات وتشطيبات عالية الجودة.', descriptionFr: 'Peintures et finitions de qualité.', featured: true, name: 'Astral', slug: 'astral' },
  { descriptionAr: 'مستلزمات احترافية للسباكة.', descriptionFr: 'Équipements fiables pour la plomberie.', featured: true, name: 'Sopal', slug: 'sopal' }
]

const products: SeedProduct[] = [
  {
    attributes: [{ labelAr: 'الوزن', labelFr: 'Poids', unit: 'g', valueAr: '500', valueFr: '500' }],
    brand: 'stanley',
    category: 'outillage-a-main',
    featured: true,
    fullAr: 'مطرقة متعددة الاستخدامات للمنازل والورش.',
    fullFr: 'Marteau polyvalent pour les petits travaux de maison et d’atelier.',
    nameAr: 'مطرقة نجار 500غ',
    nameFr: 'Marteau de menuisier 500 g',
    price: 18500,
    shortAr: 'مطرقة متينة بقبضة مريحة.',
    shortFr: 'Marteau robuste avec poignée confortable.',
    sku: 'AM-HAM-500',
    slug: 'marteau-menuisier-500g',
    stockQuantity: 32,
    stockStatus: 'in_stock',
    unit: 'piece'
  },
  {
    brand: 'stanley',
    category: 'outillage-a-main',
    fullAr: 'مفك مسطح للاستخدامات الكهربائية والميكانيكية الخفيفة.',
    fullFr: 'Tournevis plat pour les usages électriques et mécaniques légers.',
    nameAr: 'مفك مسطح 6 مم',
    nameFr: 'Tournevis plat 6 mm',
    price: 7200,
    shortAr: 'مفك عملي ودقيق.',
    shortFr: 'Tournevis pratique et précis.',
    sku: 'AM-TOR-006',
    slug: 'tournevis-plat-6mm',
    stockQuantity: 80,
    stockStatus: 'in_stock',
    unit: 'piece'
  },
  {
    attributes: [{ labelAr: 'الطاقة', labelFr: 'Puissance', unit: 'W', valueAr: '650', valueFr: '650' }],
    brand: 'bosch',
    category: 'outillage-electroportatif',
    featured: true,
    fullAr: 'مثقاب كهربائي مناسب للخشب والمعدن والجدران الخفيفة.',
    fullFr: 'Perceuse électrique adaptée au bois, au métal et aux murs légers.',
    nameAr: 'مثقاب بوش 650 واط',
    nameFr: 'Perceuse Bosch 650 W',
    newProduct: true,
    previousPrice: 189000,
    price: 169000,
    promotionalProduct: true,
    shortAr: 'مثقاب قوي للاستخدام المنزلي.',
    shortFr: 'Perceuse puissante pour usage domestique.',
    sku: 'AM-BOS-650',
    slug: 'perceuse-bosch-650w',
    stockQuantity: 14,
    stockStatus: 'in_stock',
    unit: 'piece'
  },
  {
    brand: 'bosch',
    category: 'outillage-electroportatif',
    fullAr: 'قرص قطع قطر 115 مم للمعادن.',
    fullFr: 'Disque de coupe 115 mm pour métaux.',
    nameAr: 'قرص قطع معدن 115 مم',
    nameFr: 'Disque métal 115 mm',
    price: 2800,
    shortAr: 'قرص قطع عملي للمعادن.',
    shortFr: 'Disque pratique pour coupe métal.',
    sku: 'AM-DIS-115',
    slug: 'disque-metal-115mm',
    stockQuantity: 200,
    stockStatus: 'in_stock',
    unit: 'piece'
  },
  {
    brand: 'astral',
    category: 'peinture',
    featured: true,
    fullAr: 'دهان أبيض داخلي بسعة 5 لتر.',
    fullFr: 'Peinture blanche intérieure en pot de 5 litres.',
    nameAr: 'دهان أبيض 5 لتر',
    nameFr: 'Peinture blanche 5 L',
    previousPrice: 44500,
    price: 39900,
    promotionalProduct: true,
    shortAr: 'دهان داخلي بلمسة ناعمة.',
    shortFr: 'Peinture intérieure avec finition lisse.',
    sku: 'AM-PEI-BL5',
    slug: 'peinture-blanche-5l',
    stockQuantity: 22,
    stockStatus: 'in_stock',
    unit: 'litre'
  },
  {
    brand: 'astral',
    category: 'peinture',
    fullAr: 'رولة دهان للجدران والأسقف.',
    fullFr: 'Rouleau de peinture pour murs et plafonds.',
    nameAr: 'رولة دهان 18 سم',
    nameFr: 'Rouleau peinture 18 cm',
    price: 9500,
    shortAr: 'رولة سهلة الاستخدام.',
    shortFr: 'Rouleau facile à utiliser.',
    sku: 'AM-ROL-18',
    slug: 'rouleau-peinture-18cm',
    stockQuantity: 0,
    stockStatus: 'out_of_stock',
    unit: 'piece'
  },
  {
    brand: 'sopal',
    category: 'plomberie',
    fullAr: 'أنبوب مرن يباع بالمتر.',
    fullFr: 'Tuyau flexible vendu au mètre.',
    minimumOrderQuantity: 2,
    nameAr: 'أنبوب مرن للمتر',
    nameFr: 'Tuyau flexible au mètre',
    price: 6200,
    quantityIncrement: 1,
    shortAr: 'يباع بالمتر مع حد أدنى مترين.',
    shortFr: 'Vendu au mètre avec minimum 2 mètres.',
    sku: 'AM-TUY-M',
    slug: 'tuyau-flexible-metre',
    stockQuantity: 75,
    stockStatus: 'in_stock',
    unit: 'metre'
  },
  {
    brand: 'sopal',
    category: 'plomberie',
    fullAr: 'علبة وصلات نحاسية للصيانة.',
    fullFr: 'Boîte de raccords en laiton pour maintenance.',
    nameAr: 'علبة وصلات نحاسية',
    nameFr: 'Boîte de raccords laiton',
    price: 28500,
    shortAr: 'مجموعة وصلات عملية.',
    shortFr: 'Assortiment de raccords pratique.',
    sku: 'AM-RAC-BOX',
    slug: 'boite-raccords-laiton',
    stockQuantity: 11,
    stockStatus: 'low_stock',
    unit: 'box'
  },
  {
    brand: 'bosch',
    category: 'electricite',
    fullAr: 'مصباح LED اقتصادي.',
    fullFr: 'Ampoule LED économique.',
    nameAr: 'مصباح LED 12 واط',
    nameFr: 'Ampoule LED 12 W',
    newProduct: true,
    price: 6900,
    shortAr: 'إضاءة اقتصادية للمنزل.',
    shortFr: 'Éclairage économique pour la maison.',
    sku: 'AM-LED-12',
    slug: 'ampoule-led-12w',
    stockQuantity: 140,
    stockStatus: 'in_stock',
    unit: 'piece'
  },
  {
    brand: 'stanley',
    category: 'electricite',
    fullAr: 'شريط عازل للاستعمالات الكهربائية.',
    fullFr: 'Ruban isolant pour usages électriques.',
    nameAr: 'شريط عازل أسود',
    nameFr: 'Ruban isolant noir',
    price: 3500,
    shortAr: 'شريط عازل عملي.',
    shortFr: 'Ruban isolant pratique.',
    sku: 'AM-RUB-N',
    slug: 'ruban-isolant-noir',
    stockQuantity: 60,
    stockStatus: 'in_stock',
    unit: 'piece'
  },
  {
    attributes: [{ labelAr: 'المقاس', labelFr: 'Dimension', valueAr: '6x40', valueFr: '6x40' }],
    brand: 'stanley',
    category: 'visserie-et-fixation',
    fullAr: 'علبة براغي مقاومة للصدأ.',
    fullFr: 'Boîte de vis inox résistantes à la corrosion.',
    nameAr: 'علبة براغي inox 6x40',
    nameFr: 'Boîte vis inox 6x40',
    price: 14800,
    shortAr: 'براغي inox في علبة عملية.',
    shortFr: 'Vis inox en boîte pratique.',
    sku: 'AM-VIS-640',
    slug: 'boite-vis-inox-6x40',
    stockQuantity: 38,
    stockStatus: 'in_stock',
    unit: 'box'
  },
  {
    brand: 'stanley',
    category: 'visserie-et-fixation',
    fullAr: 'علبة مقابض ومثبتات متنوعة.',
    fullFr: 'Pack de chevilles et fixations assorties.',
    minimumOrderQuantity: 3,
    nameAr: 'حزمة مثبتات متنوعة',
    nameFr: 'Pack fixations assorties',
    price: 5200,
    shortAr: 'حزمة عملية للأعمال الصغيرة.',
    shortFr: 'Pack pratique pour petits travaux.',
    sku: 'AM-FIX-PACK',
    slug: 'pack-fixations-assorties',
    stockQuantity: 45,
    stockStatus: 'in_stock',
    unit: 'pack'
  }
]

const mediaAssets = {
  hero: {
    altAr: 'مشهد أدوات ومواد لمشاريع البناء والإصلاح',
    altFr: 'Scène d’outillage et de matériaux pour les projets de construction et de réparation',
    filePath: path.resolve('public/hero1.jpg'),
    source: 'local-placeholder'
  },
  logo: {
    altAr: 'شعار أموس',
    altFr: 'Logo Amous',
    filePath: path.resolve('public/logo2.png'),
    source: 'local-placeholder'
  }
} satisfies Record<'hero' | 'logo', SeedMediaAsset>

const headerNavigation = {
  ar: [
    { label: 'الرئيسية', url: '/ar' },
    { label: 'المتجر', url: '/ar/boutique' },
    { isCategoryTrigger: true, label: 'الفئات', url: '/ar/boutique' },
    { label: 'العلامات', url: '/ar/boutique' },
    { label: 'العروض', url: '/ar/boutique?promotion=1' },
    { label: 'الجديد', url: '/ar/boutique?sort=new' },
    { label: 'المهنيون', url: '/ar/recherche?q=pro' },
    { label: 'من نحن', url: '/ar/recherche?q=amous' },
    { label: 'اتصل بنا', url: '/ar/recherche?q=contact' }
  ],
  fr: [
    { label: 'Accueil', url: '/fr' },
    { label: 'Boutique', url: '/fr/boutique' },
    { isCategoryTrigger: true, label: 'Catégories', url: '/fr/nos-categories' },
    { label: 'Marques', url: '/fr/boutique' },
    { label: 'Promotions', url: '/fr/boutique?promotion=1' },
    { label: 'Nouveautés', url: '/fr/boutique?sort=new' },
    { label: 'Professionnels', url: '/fr/recherche?q=pro' },
    { label: 'À propos', url: '/fr/recherche?q=amous' },
    { label: 'Contact', url: '/fr/recherche?q=contact' }
  ]
} satisfies Record<'ar' | 'fr', SeedHeaderNavItem[]>

async function upsertMediaAsset(payload: Awaited<ReturnType<typeof getPayload>>, asset: SeedMediaAsset) {
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    overrideAccess: true,
    where: {
      altFr: {
        equals: asset.altFr
      }
    }
  })

  if (existing.docs[0]) {
    await payload.update({
      collection: 'media',
      data: {
        altAr: asset.altAr,
        altFr: asset.altFr,
        metadata: {
          source: asset.source
        }
      },
      id: existing.docs[0].id,
      overrideAccess: true
    })

    return existing.docs[0]
  }

  return payload.create({
    collection: 'media',
    data: {
      altAr: asset.altAr,
      altFr: asset.altFr,
      metadata: {
        source: asset.source
      }
    },
    filePath: asset.filePath,
    overrideAccess: true
  })
}

async function upsertCategory(payload: Awaited<ReturnType<typeof getPayload>>, category: SeedCategory) {
  const existing = await payload.find({
    collection: 'categories',
    limit: 1,
    locale: 'fr',
    overrideAccess: true,
    where: { slug: { equals: category.fr.slug } }
  })

  const data = {
    active: true,
    description: category.fr.description,
    displayOrder: category.order,
    featured: category.featured ?? false,
    name: category.fr.name,
    slug: category.fr.slug,
    seo: {
      description: category.fr.description,
      title: category.fr.name
    }
  }

  const doc =
    existing.docs[0] ??
    (await payload.create({
      collection: 'categories',
      data,
      locale: 'fr',
      overrideAccess: true
    }))

  if (existing.docs[0]) {
    await payload.update({ collection: 'categories', data, id: doc.id, locale: 'fr', overrideAccess: true })
  }

  await payload.update({
    collection: 'categories',
    data: {
      description: category.ar.description,
      name: category.ar.name,
      seo: {
        description: category.ar.description,
        title: category.ar.name
      },
      slug: category.ar.slug
    },
    id: doc.id,
    locale: 'ar',
    overrideAccess: true
  })

  return doc
}

async function upsertBrand(payload: Awaited<ReturnType<typeof getPayload>>, brand: SeedBrand) {
  const existing = await payload.find({
    collection: 'brands',
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: brand.slug } }
  })
  const data = {
    active: true,
    description: brand.descriptionFr,
    featured: brand.featured ?? false,
    name: brand.name,
    seo: {
      description: brand.descriptionFr,
      title: brand.name
    },
    slug: brand.slug
  }
  const doc =
    existing.docs[0] ??
    (await payload.create({
      collection: 'brands',
      data,
      locale: 'fr',
      overrideAccess: true
    }))

  if (existing.docs[0]) {
    await payload.update({ collection: 'brands', data, id: doc.id, locale: 'fr', overrideAccess: true })
  }

  await payload.update({
    collection: 'brands',
    data: {
      description: brand.descriptionAr,
      seo: {
        description: brand.descriptionAr,
        title: brand.name
      }
    },
    id: doc.id,
    locale: 'ar',
    overrideAccess: true
  })

  return doc
}

async function upsertProduct(
  payload: Awaited<ReturnType<typeof getPayload>>,
  product: SeedProduct,
  categoryIds: Map<string, number | string>,
  brandIds: Map<string, number | string>
) {
  const existing = await payload.find({
    collection: 'products',
    limit: 1,
    overrideAccess: true,
    where: { sku: { equals: product.sku } }
  })
  const data = {
    active: true,
    brand: brandIds.get(product.brand),
    category: categoryIds.get(product.category),
    featured: product.featured ?? false,
    fullDescription: product.fullFr,
    minimumOrderQuantity: product.minimumOrderQuantity ?? 1,
    name: product.nameFr,
    newProduct: product.newProduct ?? false,
    previousPrice: product.previousPrice,
    promotionalProduct: product.promotionalProduct ?? false,
    publicPrice: product.price,
    quantityIncrement: product.quantityIncrement ?? 1,
    seo: {
      description: product.shortFr,
      title: product.nameFr
    },
    shortDescription: product.shortFr,
    sku: product.sku,
    slug: product.slug,
    stockQuantity: product.stockQuantity,
    stockStatus: product.stockStatus,
    technicalAttributes:
      product.attributes?.map((attribute) => ({
        label: attribute.labelFr,
        unit: attribute.unit,
        value: attribute.valueFr
      })) ?? [],
    unit: product.unit,
    vatRate: 19
  }

  const doc =
    existing.docs[0] ??
    (await payload.create({
      collection: 'products',
      data,
      locale: 'fr',
      overrideAccess: true
    }))

  if (existing.docs[0]) {
    await payload.update({ collection: 'products', data, id: doc.id, locale: 'fr', overrideAccess: true })
  }

  await payload.update({
    collection: 'products',
    data: {
      fullDescription: product.fullAr,
      name: product.nameAr,
      seo: {
        description: product.shortAr,
        title: product.nameAr
      },
      shortDescription: product.shortAr,
      technicalAttributes:
        product.attributes?.map((attribute) => ({
          label: attribute.labelAr,
          unit: attribute.unit,
          value: attribute.valueAr
        })) ?? []
    },
    id: doc.id,
    locale: 'ar',
    overrideAccess: true
  })

  return doc
}

async function upsertHeroSlide(payload: Awaited<ReturnType<typeof getPayload>>, heroImageId: string | number) {
  const existing = await payload.find({
    collection: 'hero-slides',
    draft: false,
    limit: 1,
    locale: 'fr',
    overrideAccess: true,
    where: {
      internalName: {
        equals: 'homepage-core-hero'
      }
    }
  })

  const frData = {
    _status: 'published',
    active: true,
    contentPosition: 'center',
    desktopImage: heroImageId,
    displayOrder: 10,
    eyebrow: 'Tout pour vos projets',
    internalName: 'homepage-core-hero',
    mobileImage: heroImageId,
    overlayStrength: 'medium',
    primaryCtaLabel: 'Découvrir les produits',
    primaryCtaUrl: '/fr/boutique',
    secondaryCtaLabel: 'Demander un devis',
    secondaryCtaUrl: '/fr/recherche?q=devis',
    startDate: '2026-01-01T00:00:00.000Z',
    subtitle: 'Découvrez notre sélection d’outillage, de plomberie, d’électricité, de peinture et de fixation.',
    textAlignment: 'left',
    textTheme: 'light',
    title: 'Équipez-vous pour construire, réparer et réussir'
  }

  const doc =
    existing.docs[0] ??
    (await payload.create({
      collection: 'hero-slides',
      data: frData,
      locale: 'fr',
      overrideAccess: true
    }))

  if (existing.docs[0]) {
    await payload.update({
      collection: 'hero-slides',
      data: frData,
      id: doc.id,
      locale: 'fr',
      overrideAccess: true
    })
  }

  await payload.update({
    collection: 'hero-slides',
    data: {
      _status: 'published',
      eyebrow: 'كل ما تحتاجه لمشاريعك',
      primaryCtaLabel: 'اكتشف المنتجات',
      primaryCtaUrl: '/ar/boutique',
      secondaryCtaLabel: 'اطلب عرض سعر',
      secondaryCtaUrl: '/ar/recherche?q=devis',
      subtitle: 'اكتشف مجموعتنا المختارة من الأدوات والسباكة والكهرباء والدهان ومواد التثبيت.',
      title: 'تجهز للبناء والإصلاح والنجاح'
    },
    id: doc.id,
    locale: 'ar',
    overrideAccess: true
  })

  return doc
}

async function seed() {
  const { default: configPromise } = await import('@payload-config')
  const payload = await getPayload({ config: configPromise })
  const categoryIds = new Map<string, string | number>()
  const brandIds = new Map<string, string | number>()
  const productIds: Array<string | number> = []
  const logoMedia = await upsertMediaAsset(payload, mediaAssets.logo)
  const heroMedia = await upsertMediaAsset(payload, mediaAssets.hero)

  const adminEmail = 'admin@amous.local'
  const existingAdmin = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: adminEmail } }
  })

  if (!existingAdmin.docs[0]) {
    await payload.create({
      collection: 'users',
      data: {
        active: true,
        email: adminEmail,
        name: 'Amous Admin',
        password: 'ChangeMe123!',
        preferredLocale: 'fr',
        role: 'admin'
      },
      overrideAccess: true
    })
  }

  for (const category of categories) {
    const doc = await upsertCategory(payload, category)
    categoryIds.set(category.fr.slug, doc.id)
  }

  for (const brand of brands) {
    const doc = await upsertBrand(payload, brand)
    brandIds.set(brand.slug, doc.id)
  }

  for (const product of products) {
    const doc = await upsertProduct(payload, product, categoryIds, brandIds)
    productIds.push(doc.id)
  }

  await payload.updateGlobal({
    data: {
      announcementText: 'Livraison, retrait et conseil produit disponibles selon les références.',
      logo: logoMedia.id,
      navigationItems: headerNavigation.fr,
      searchPlaceholder: 'Rechercher un produit, une marque ou une référence...',
      showAccount: true,
      showCart: true,
      showWishlist: true,
      stickyHeaderEnabled: true
    },
    locale: 'fr',
    overrideAccess: true,
    slug: 'header'
  })

  await payload.updateGlobal({
    data: {
      announcementText: 'التوصيل والاستلام من المتجر ونصائح المنتج متوفرة حسب المراجع.',
      navigationItems: headerNavigation.ar,
      searchPlaceholder: 'ابحث عن منتج أو علامة تجارية أو مرجع...',
      showAccount: true,
      showCart: true,
      showWishlist: true,
      stickyHeaderEnabled: true
    },
    locale: 'ar',
    overrideAccess: true,
    slug: 'header'
  })

  await upsertHeroSlide(payload, heroMedia.id)

  await payload.updateGlobal({
    data: {
      address: 'Tunis, Tunisie',
      defaultSeo: {
        description: 'Amous, boutique de quincaillerie et bricolage en Tunisie.',
        title: 'Amous'
      },
      email: 'contact@amous.local',
      footer: {
        copyrightText: '© Amous'
      },
      header: {
        searchPlaceholder: 'Rechercher un produit, une référence, une marque...'
      },
      phone: '+216 00 000 000',
      siteName: 'Amous',
      whatsappNumber: '21600000000'
    },
    locale: 'fr',
    overrideAccess: true,
    slug: 'site-settings'
  })

  await payload.updateGlobal({
    data: {
      address: 'تونس',
      defaultSeo: {
        description: 'أموس، متجر معدات ومواد الصيانة في تونس.',
        title: 'أموس'
      },
      footer: {
        copyrightText: '© أموس'
      },
      header: {
        searchPlaceholder: 'ابحث عن منتج أو مرجع أو علامة...'
      }
    },
    locale: 'ar',
    overrideAccess: true,
    slug: 'site-settings'
  })

  await payload.updateGlobal({
    data: {
      announcementText: 'Livraison et retrait en magasin disponibles sur une sélection de produits.',
      benefits: [
        { description: 'Des références claires et des stocks visibles.', title: 'Catalogue fiable' },
        { description: 'Des informations produit utiles avant l’achat.', title: 'Conseil produit' },
        { description: 'Retrait magasin ou livraison selon disponibilité.', title: 'Livraison flexible' }
      ],
      featuredBrands: Array.from(brandIds.values()),
      featuredCategories: Array.from(categoryIds.values()),
      featuredProducts: productIds.slice(0, 12),
      heroCtaLabel: 'Voir la boutique',
      heroCtaUrl: '/fr/boutique',
      heroSubtitle: 'Trouvez rapidement les outils, matériaux et accessoires essentiels pour vos travaux.',
      heroTitle: 'Votre quincaillerie moderne pour la maison et le chantier'
    },
    locale: 'fr',
    overrideAccess: true,
    slug: 'homepage'
  })

  await payload.updateGlobal({
    data: {
      announcementText: 'التوصيل والاستلام من المتجر متوفران على مجموعة من المنتجات.',
      benefits: [
        { description: 'مراجع واضحة ومخزون ظاهر.', title: 'كتالوج موثوق' },
        { description: 'معلومات تساعدك قبل الشراء.', title: 'نصائح المنتج' },
        { description: 'استلام من المتجر أو توصيل حسب التوفر.', title: 'توصيل مرن' }
      ],
      heroCtaLabel: 'زيارة المتجر',
      heroCtaUrl: '/ar/boutique',
      heroSubtitle: 'اعثر بسرعة على الأدوات والمواد والإكسسوارات الأساسية لأعمالك.',
      heroTitle: 'متجر عصري لمستلزمات المنزل والأعمال'
    },
    locale: 'ar',
    overrideAccess: true,
    slug: 'homepage'
  })

  await payload.updateGlobal({
    data: {
      defaultDeliveryFee: 7000,
      estimatedDeliveryText: 'Livraison estimee sous 24 a 72 heures selon disponibilite.',
      freeDeliveryThreshold: 150000,
      homeDeliveryEnabled: true,
      storePickupEnabled: false,
      supportedGovernorates: [
        { name: 'Tunis' },
        { name: 'Ariana' },
        { name: 'Ben Arous' },
        { name: 'Manouba' },
        { name: 'Sousse' },
        { name: 'Sfax' }
      ]
    },
    locale: 'fr',
    overrideAccess: true,
    slug: 'delivery-config'
  })

  await payload.updateGlobal({
    data: {
      estimatedDeliveryText: 'توصيل متوقع خلال 24 إلى 72 ساعة حسب التوفر.',
      supportedGovernorates: [
        { name: 'Tunis' },
        { name: 'Ariana' },
        { name: 'Ben Arous' },
        { name: 'Manouba' },
        { name: 'Sousse' },
        { name: 'Sfax' }
      ]
    },
    locale: 'ar',
    overrideAccess: true,
    slug: 'delivery-config'
  })

  console.log(`Seed complete. Admin: ${adminEmail} / ChangeMe123!`)
}

seed().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
