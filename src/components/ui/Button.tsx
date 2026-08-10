import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex min-h-[var(--touch-target)] items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
  {
    defaultVariants: {
      variant: 'primary'
    },
    variants: {
      variant: {
        ghost: 'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-slate-100',
        primary: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:brightness-95',
        secondary: 'bg-[var(--color-secondary)] text-white hover:brightness-110'
      }
    }
  }
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />
}
