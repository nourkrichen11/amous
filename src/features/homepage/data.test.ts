import { beforeEach, describe, expect, it, vi } from 'vitest'

const findMock = vi.fn()
const findGlobalMock = vi.fn()

vi.mock('@/lib/payload/getPayload', () => ({
  getPayloadClient: async () => ({
    find: findMock,
    findGlobal: findGlobalMock
  })
}))

describe('homepage data', () => {
  beforeEach(() => {
    findMock.mockReset()
    findGlobalMock.mockReset()
  })

  it('requests only active, published, in-range hero slides and maps valid media', async () => {
    findMock.mockResolvedValue({
      docs: [
        {
          active: true,
          contentPosition: 'center',
          desktopImage: { altFr: 'Hero', id: 'media-1', url: '/hero1.jpg' },
          id: 'slide-1',
          overlayStrength: 'medium',
          textAlignment: 'left',
          textTheme: 'light',
          title: 'Hero title'
        }
      ]
    })

    const { getHeroSlides } = await import('./data')
    const slides = await getHeroSlides('fr', new Date('2026-08-03T12:00:00.000Z'))

    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'hero-slides',
        draft: false,
        limit: 3,
        locale: 'fr',
        sort: 'displayOrder'
      })
    )
    expect(findMock.mock.calls[0][0].where).toEqual(
      expect.objectContaining({
        and: expect.arrayContaining([
          { active: { equals: true } },
          expect.objectContaining({ or: expect.any(Array) }),
          expect.objectContaining({ or: expect.any(Array) })
        ])
      })
    )
    expect(slides).toHaveLength(1)
    expect(slides[0].title).toBe('Hero title')
  })

  it('uses fallback header content when the CMS global is unavailable', async () => {
    findGlobalMock.mockRejectedValue(new Error('cms unavailable'))

    const { getHeader } = await import('./data')
    const header = await getHeader('fr')

    expect(header.navigationItems).toHaveLength(9)
    expect(header.searchPlaceholder).toBe('Rechercher un produit, une marque ou une référence...')
  })
})
