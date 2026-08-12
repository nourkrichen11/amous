import Image from 'next/image'

import type { MediaItem } from '@/features/catalogue/types'

type ProductImageProps = {
  image?: MediaItem
  name: string
  priority?: boolean
  sizes?: string
}

export function ProductImage({ image, name, priority, sizes = '(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 280px' }: ProductImageProps) {
  const src = image?.url || '/placeholders/product.svg'

  return (
    <div className="aspect-[var(--product-image-ratio)] overflow-hidden rounded-md bg-[#f7f9fc]">
      <Image
        alt={image?.alt || name}
        className="h-full w-full object-contain p-4 transition-transform duration-200 group-hover:scale-[1.02]"
        height={480}
        priority={priority}
        sizes={sizes}
        src={src}
        width={640}
      />
    </div>
  )
}
