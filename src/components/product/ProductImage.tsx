import Image from 'next/image'
import { ImageOff } from 'lucide-react'

import type { MediaItem } from '@/features/catalogue/types'
import { cn } from '@/lib/utils/cn'

type ProductImageProps = {
  className?: string
  image?: MediaItem
  name: string
  priority?: boolean
  sizes?: string
}

type ProductImageFallbackProps = {
  className?: string
  name: string
}

/** Neutral placeholder used whenever a product has no usable image. */
export function ProductImageFallback({ className, name }: ProductImageFallbackProps) {
  return (
    <div
      aria-label={name}
      className={cn('flex h-full w-full flex-col items-center justify-center gap-2 bg-[var(--color-image-well)] text-slate-400', className)}
      role="img"
    >
      <ImageOff aria-hidden="true" size={28} strokeWidth={1.5} />
      <span aria-hidden="true" className="text-[11px] font-medium uppercase tracking-wide">
        Image indisponible
      </span>
    </div>
  )
}

export function ProductImage({ className, image, name, priority, sizes = '(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 320px' }: ProductImageProps) {
  return (
    <div className={cn('aspect-[var(--product-image-ratio)] overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-image-well)]', className)}>
      {image?.url ? (
        <Image
          alt={image.alt || name}
          className="h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-[1.03] sm:p-4"
          height={image.height || 480}
          priority={priority}
          sizes={sizes}
          src={image.url}
          width={image.width || 640}
        />
      ) : (
        <ProductImageFallback name={name} />
      )}
    </div>
  )
}
