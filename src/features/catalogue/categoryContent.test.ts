import { describe, expect, it } from 'vitest'

import { amousCategoryDefinitions, homepageCategoryCount } from './categoryContent'

describe('amous category definitions', () => {
  it('contains the full 19-category catalogue in display order', () => {
    expect(amousCategoryDefinitions).toHaveLength(19)
    expect(amousCategoryDefinitions.map((category) => category.name)).toEqual([
      'Outillage à main',
      'Quincaillerie',
      'Outillage électroportatif',
      'Mesure et contrôle',
      'Jardinage',
      'Maison',
      'Protection et sécurité',
      'Pneumatique',
      'Manutention et levage',
      'Électricité',
      'Boulonnerie et visserie',
      'Peinture',
      'Outils de coupe et perçage',
      'Pompes et générateurs',
      'Matériel d’équipement',
      'Soudage et accessoires',
      'Tuyauterie et accessoires',
      'Abrasifs',
      'Ateliers professionnels'
    ])
    expect(amousCategoryDefinitions.map((category) => category.displayOrder)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
    ])
  })

  it('marks exactly eight categories for homepage display', () => {
    const homepageCategories = amousCategoryDefinitions.filter((category) => category.showOnHomepage)

    expect(homepageCategories).toHaveLength(homepageCategoryCount)
    expect(homepageCategories.map((category) => category.slug)).toEqual([
      'outillage-a-main',
      'quincaillerie',
      'outillage-electroportatif',
      'jardinage',
      'protection-et-securite',
      'electricite',
      'boulonnerie-visserie',
      'peinture'
    ])
  })

  it('uses unique slugs and image file names', () => {
    const slugs = amousCategoryDefinitions.map((category) => category.slug)
    const imageFiles = amousCategoryDefinitions.map((category) => category.imageFileName)

    expect(new Set(slugs).size).toBe(slugs.length)
    expect(new Set(imageFiles).size).toBe(imageFiles.length)
  })
})
