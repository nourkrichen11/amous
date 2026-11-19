'use client'

import type React from 'react'

import { useRef } from 'react'

import { cn } from '@/lib/utils/cn'

type AdminAutoSubmitFormProps = {
  action: string
  children: React.ReactNode
  className?: string
}

export function AdminAutoSubmitForm({ action, children, className }: AdminAutoSubmitFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const timeoutRef = useRef<number | null>(null)

  const clearPendingSubmit = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const submitForm = () => {
    clearPendingSubmit()
    formRef.current?.requestSubmit()
  }

  const scheduleSubmit = () => {
    clearPendingSubmit()
    timeoutRef.current = window.setTimeout(() => {
      formRef.current?.requestSubmit()
      timeoutRef.current = null
    }, 320)
  }

  const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
    const target = event.target

    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
      return
    }

    if (target.type === 'search' || target.type === 'text') {
      scheduleSubmit()
      return
    }

    submitForm()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    const target = event.target

    if (!(target instanceof HTMLInputElement) || (target.type !== 'search' && target.type !== 'text')) {
      return
    }

    event.preventDefault()
    submitForm()
  }

  return (
    <form
      action={action}
      className={cn('amous-filter-form', className)}
      method="get"
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      ref={formRef}
    >
      {children}
    </form>
  )
}
