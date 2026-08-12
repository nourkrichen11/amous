import Image from 'next/image'
import Link from 'next/link'
import { Package } from 'lucide-react'

type ProductCellProps = {
  href: string
  imageAlt?: string
  imageURL?: string | null
  name: string
}

export function ProductCell({ href, imageAlt, imageURL, name }: ProductCellProps) {
  return (
    <div className="amous-product-cell">
      <span className="amous-product-cell__image">
        {imageURL ? <Image alt={imageAlt || name} fill sizes="40px" src={imageURL} unoptimized /> : <Package aria-hidden="true" size={18} />}
      </span>
      <span className="amous-product-cell__content">
        <Link className="amous-product-cell__title" href={href}>
          {name}
        </Link>
      </span>
    </div>
  )
}
