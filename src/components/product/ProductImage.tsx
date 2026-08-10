import Image from 'next/image'

import type { MediaItem } from '@/features/catalogue/types'

type ProductImageProps = {
  image?: MediaItem
  name: string
  priority?: boolean
}

export function ProductImage({ image, name, priority }: ProductImageProps) {
  const src = image?.url || '/placeholders/product.svg'

  return (
    <div className="aspect-[var(--product-image-ratio)] overflow-hidden rounded-md bg-slate-100">
      <Image
        alt={image?.alt || name}
        className="h-full w-full object-cover"
        height={480}
        priority={priority}
        src={src}
        width={640}
      />
    </div>
  )
}
