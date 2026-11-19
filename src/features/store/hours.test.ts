import { describe, expect, it } from 'vitest'

import type { OpeningHoursRule } from '@/config/store'

import { getOpenStatus, getZonedDayAndMinutes, groupOpeningHours, hasOpeningHours } from './hours'

const rules: OpeningHoursRule[] = [
  { days: ['mon', 'tue', 'wed', 'thu', 'fri'], slots: [{ closes: '12:30', opens: '08:00' }, { closes: '18:00', opens: '14:30' }] },
  { days: ['sat'], slots: [{ closes: '13:00', opens: '08:00' }] }
]

describe('opening hours', () => {
  it('shows nothing when hours are not configured', () => {
    expect(hasOpeningHours([])).toBe(false)
    expect(groupOpeningHours([])).toEqual([])
    expect(getOpenStatus([], new Date(), 'Africa/Tunis')).toBeUndefined()
  })

  it('ignores invalid slots instead of guessing', () => {
    expect(hasOpeningHours([{ days: ['mon'], slots: [{ closes: '08:00', opens: '18:00' }] }])).toBe(false)
    expect(hasOpeningHours([{ days: ['mon'], slots: [{ closes: '25:00', opens: '08:00' }] }])).toBe(false)
  })

  it('groups consecutive days with identical hours', () => {
    expect(groupOpeningHours(rules)).toEqual([
      { closed: false, hours: '08:00 – 12:30, 14:30 – 18:00', label: 'Lundi – Vendredi' },
      { closed: false, hours: '08:00 – 13:00', label: 'Samedi' },
      { closed: true, hours: 'Fermé', label: 'Dimanche' }
    ])
  })

  it('computes the local time in Africa/Tunis (UTC+1, no DST)', () => {
    // 2026-11-16 is a Monday. 09:15 UTC = 10:15 in Tunis.
    expect(getZonedDayAndMinutes(new Date('2026-11-16T09:15:00Z'), 'Africa/Tunis')).toEqual({ day: 'mon', minutes: 615 })
    // 23:30 UTC on Sunday is already Monday 00:30 in Tunis.
    expect(getZonedDayAndMinutes(new Date('2026-11-15T23:30:00Z'), 'Africa/Tunis')).toEqual({ day: 'mon', minutes: 30 })
  })

  it('returns open/closed using the store timezone', () => {
    expect(getOpenStatus(rules, new Date('2026-11-16T09:15:00Z'), 'Africa/Tunis')).toBe('open') // Mon 10:15
    expect(getOpenStatus(rules, new Date('2026-11-16T12:00:00Z'), 'Africa/Tunis')).toBe('closed') // Mon 13:00 lunch break
    expect(getOpenStatus(rules, new Date('2026-11-16T17:00:00Z'), 'Africa/Tunis')).toBe('closed') // Mon 18:00 closing time
    expect(getOpenStatus(rules, new Date('2026-11-21T08:00:00Z'), 'Africa/Tunis')).toBe('open') // Sat 09:00
    expect(getOpenStatus(rules, new Date('2026-11-22T10:00:00Z'), 'Africa/Tunis')).toBe('closed') // Sunday
  })
})
