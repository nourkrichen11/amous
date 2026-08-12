'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { ResolvedSearchParams } from '@/features/catalogue/searchParams'
import type { CategoryItem } from '@/features/catalogue/types'
import { buildCatalogueHref } from '@/features/catalogue/url'

type CategoryRailProps = {
  categories: CategoryItem[]
  params: ResolvedSearchParams
  path: string
}

type CategoryRailItemProps = {
  active: boolean
  category?: CategoryItem
  href: string
  label: string
}

const categoryImageFallback = '/images/categories/category-placeholder.webp'

function CategoryRailItem({ active, category, href, label }: CategoryRailItemProps) {
  const imageSrc = category?.image?.url

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={`category-rail-item inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-semibold transition duration-200 focus-visible:outline-offset-2 md:h-11 md:gap-2 md:px-4 ${
        active
          ? 'border-[#1d4ed8] bg-[#1d4ed8] text-white shadow-[0_8px_18px_rgb(29_78_216_/_0.22)]'
          : 'border-[#d8dee6] bg-white text-[#172033] shadow-[0_1px_2px_rgb(15_23_42_/_0.04)] hover:-translate-y-px hover:border-[#93c5fd] hover:bg-[#eff6ff] hover:shadow-[0_8px_18px_rgb(15_23_42_/_0.08)]'
      }`}
      data-active={active ? 'true' : undefined}
      href={href}
    >
      {imageSrc ? (
        <span className={`flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/90 md:size-6 ${active ? 'ring-1 ring-white/45' : 'ring-1 ring-slate-200/80'}`} aria-hidden="true">
          <Image
            alt=""
            className="size-full object-contain p-0.5"
            height={32}
            sizes="24px"
            src={imageSrc || categoryImageFallback}
            width={32}
          />
        </span>
      ) : null}
      <span>{label}</span>
    </Link>
  )
}

export function CategoryRail({ categories, params, path }: CategoryRailProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const activeSlug = params.category ?? ''
  const [canScrollPrevious, setCanScrollPrevious] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    const track = trackRef.current

    if (!viewport || !track || track.scrollWidth <= viewport.clientWidth + 1) {
      setCanScrollPrevious(false)
      setCanScrollNext(false)
      return
    }

    const viewportRect = viewport.getBoundingClientRect()
    const trackRect = track.getBoundingClientRect()

    setCanScrollPrevious(trackRect.left < viewportRect.left - 2)
    setCanScrollNext(trackRect.right > viewportRect.right + 2)
  }, [])

  const scrollToItem = useCallback((direction: 'previous' | 'next') => {
    const viewport = viewportRef.current
    const track = trackRef.current

    if (!viewport || !track) {
      return
    }

    const viewportRect = viewport.getBoundingClientRect()
    const items = Array.from(track.querySelectorAll<HTMLElement>('.category-rail-item'))
    const target =
      direction === 'next'
        ? items.find((item) => item.getBoundingClientRect().right > viewportRect.right + 1)
        : [...items].reverse().find((item) => item.getBoundingClientRect().left < viewportRect.left - 1)

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: direction === 'next' ? 'end' : 'start'
      })
    } else {
      viewport.scrollBy({ behavior: 'smooth', left: direction === 'next' ? 360 : -360 })
    }
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    updateScrollState()

    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(viewport)

    window.addEventListener('resize', updateScrollState)
    viewport.addEventListener('scroll', updateScrollState, { passive: true })

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateScrollState)
      viewport.removeEventListener('scroll', updateScrollState)
    }
  }, [categories.length, updateScrollState])

  useEffect(() => {
    const track = trackRef.current
    const activeItem = track?.querySelector<HTMLElement>('[data-active="true"]')

    activeItem?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })

    window.setTimeout(updateScrollState, 240)
  }, [activeSlug, updateScrollState])

  return (
    <div className="relative">
      <div
        className="scrollbar-none overflow-x-auto overscroll-x-contain scroll-smooth py-1"
        ref={viewportRef}
      >
        <div className="flex min-w-max items-center gap-2 md:gap-2.5" ref={trackRef}>
          <CategoryRailItem
            active={!params.category}
            href={buildCatalogueHref(path, params, { category: null, subcategory: null })}
            label="Tous"
          />
          {categories.map((category) => (
            <CategoryRailItem
              active={category.slug === params.category}
              category={category}
              href={buildCatalogueHref(path, params, { category: category.slug, subcategory: null })}
              key={String(category.id)}
              label={category.name}
            />
          ))}
        </div>
      </div>

      {canScrollPrevious ? <div className="pointer-events-none absolute inset-y-0 start-0 w-8 bg-gradient-to-r from-[var(--color-background)] to-transparent md:w-14" aria-hidden="true" /> : null}
      {canScrollNext ? <div className="pointer-events-none absolute inset-y-0 end-0 w-8 bg-gradient-to-l from-[var(--color-background)] to-transparent md:w-14" aria-hidden="true" /> : null}

      {canScrollPrevious ? (
        <button
          aria-label="Faire defiler les categories vers la gauche"
          className="absolute start-1 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8dee6] bg-white text-[#172033] shadow-[0_8px_20px_rgb(15_23_42_/_0.14)] transition hover:border-[#93c5fd] hover:bg-[#eff6ff] md:inline-flex"
          onClick={() => scrollToItem('previous')}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2.4} />
        </button>
      ) : null}

      {canScrollNext ? (
        <button
          aria-label="Faire defiler les categories vers la droite"
          className="absolute end-1 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#d8dee6] bg-white text-[#172033] shadow-[0_8px_20px_rgb(15_23_42_/_0.14)] transition hover:border-[#93c5fd] hover:bg-[#eff6ff] md:inline-flex"
          onClick={() => scrollToItem('next')}
          type="button"
        >
          <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2.4} />
        </button>
      ) : null}
    </div>
  )
}
