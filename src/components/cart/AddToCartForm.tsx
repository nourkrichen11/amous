'use client'

import { useFormStatus } from 'react-dom'

import { addToCartAction } from '@/features/cart/actions'
import type { ProductItem } from '@/features/catalogue/types'
import type { Locale } from '@/i18n/config'
import { t } from '@/i18n/config'
import { cn } from '@/lib/utils/cn'

type AddToCartFormProps = {
  buttonClassName?: string
  className?: string
  locale: Locale
  product: ProductItem
  quantityInput?: boolean
  sourcePath: string
}

function SubmitButton({ className, disabled, locale }: { className?: string; disabled: boolean; locale: Locale }) {
  const status = useFormStatus()

  return (
    <button
      className={cn(
        'min-h-[var(--touch-target)] rounded-md bg-[var(--color-primary)] px-4 font-semibold text-white transition-colors hover:bg-[#c70511] disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      disabled={disabled || status.pending}
      type="submit"
    >
      {status.pending ? t(locale, 'cart.adding') : t(locale, 'product.addToCart')}
    </button>
  )
}

export function AddToCartForm({ buttonClassName, className, locale, product, quantityInput = false, sourcePath }: AddToCartFormProps) {
  const disabled = product.stockStatus === 'out_of_stock' || product.stockQuantity < product.minimumOrderQuantity

  return (
    <form action={addToCartAction} className={className}>
      <input name="locale" type="hidden" value={locale} />
      <input name="productId" type="hidden" value={String(product.id)} />
      <input name="sourcePath" type="hidden" value={sourcePath} />
      {quantityInput ? (
        <label className="grid gap-1 text-sm font-semibold">
          {t(locale, 'product.quantity')}
          <input
            className="min-h-[var(--touch-target)] rounded-md border border-[var(--color-border)] px-3"
            defaultValue={product.minimumOrderQuantity}
            min={product.minimumOrderQuantity}
            name="quantity"
            step={product.quantityIncrement}
            type="number"
          />
        </label>
      ) : (
        <input name="quantity" type="hidden" value={product.minimumOrderQuantity} />
      )}
      <SubmitButton className={buttonClassName} disabled={disabled} locale={locale} />
      {disabled ? <p className="mt-2 text-sm text-[var(--color-error)]">{t(locale, 'product.outOfStock')}</p> : null}
    </form>
  )
}
