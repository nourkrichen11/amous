'use client'

import { useSyncExternalStore } from 'react'

import type { OpeningHoursRule } from '@/config/store'
import { getOpenStatus } from '@/features/store/hours'

type StoreOpenStatusProps = {
  rules: OpeningHoursRule[]
  timeZone: string
}

// Re-evaluate once a minute; the server snapshot is null so nothing is rendered
// (and nothing can be stale) in cached HTML.
function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000)
  return () => window.clearInterval(timer)
}

const getMinute = () => Math.floor(Date.now() / 60_000)
const getServerMinute = () => null

export function StoreOpenStatus({ rules, timeZone }: StoreOpenStatusProps) {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute)
  const status = minute === null ? undefined : getOpenStatus(rules, new Date(minute * 60_000), timeZone)

  if (!status) {
    return null
  }

  const isOpen = status === 'open'

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        isOpen ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-[var(--color-footer-muted)]'
      ].join(' ')}
      role="status"
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-[var(--color-primary)]'}`} />
      {isOpen ? 'Ouvert maintenant' : 'Fermé'}
    </span>
  )
}
