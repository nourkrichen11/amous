import type { OpeningHoursRule, Weekday } from '@/config/store'

export const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const WEEKDAY_LABELS_FR: Record<Weekday, string> = {
  fri: 'Vendredi',
  mon: 'Lundi',
  sat: 'Samedi',
  sun: 'Dimanche',
  thu: 'Jeudi',
  tue: 'Mardi',
  wed: 'Mercredi'
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export type OpeningHoursRow = {
  label: string
  hours: string
  closed: boolean
}

function toMinutes(value: string): number | undefined {
  const match = TIME_PATTERN.exec(value)
  return match ? Number(match[1]) * 60 + Number(match[2]) : undefined
}

function isValidSlot(slot: { opens: string; closes: string }) {
  const opens = toMinutes(slot.opens)
  const closes = toMinutes(slot.closes)
  return opens !== undefined && closes !== undefined && closes > opens
}

/** Day → formatted slots ("08:00 – 12:30, 14:30 – 18:00"), or undefined when closed. */
function getDaySchedule(rules: OpeningHoursRule[]): Map<Weekday, string | undefined> {
  const schedule = new Map<Weekday, string | undefined>(WEEKDAYS.map((day) => [day, undefined]))

  rules.forEach((rule) => {
    const slots = rule.slots.filter(isValidSlot)
    if (slots.length === 0) {
      return
    }

    const formatted = slots.map((slot) => `${slot.opens} – ${slot.closes}`).join(', ')
    rule.days.forEach((day) => schedule.set(day, formatted))
  })

  return schedule
}

export function hasOpeningHours(rules: OpeningHoursRule[]): boolean {
  return rules.some((rule) => rule.days.length > 0 && rule.slots.some(isValidSlot))
}

/** Groups consecutive weekdays that share identical hours: "Lundi – Vendredi", "Samedi", "Dimanche". */
export function groupOpeningHours(rules: OpeningHoursRule[]): OpeningHoursRow[] {
  if (!hasOpeningHours(rules)) {
    return []
  }

  const schedule = getDaySchedule(rules)
  const rows: Array<{ from: Weekday; to: Weekday; hours?: string }> = []

  WEEKDAYS.forEach((day) => {
    const hours = schedule.get(day)
    const last = rows.at(-1)

    if (last && last.hours === hours) {
      last.to = day
    } else {
      rows.push({ from: day, hours, to: day })
    }
  })

  return rows.map((row) => ({
    closed: !row.hours,
    hours: row.hours ?? 'Fermé',
    label: row.from === row.to ? WEEKDAY_LABELS_FR[row.from] : `${WEEKDAY_LABELS_FR[row.from]} – ${WEEKDAY_LABELS_FR[row.to]}`
  }))
}

/** Local weekday and minutes-since-midnight for `date` in `timeZone`. */
export function getZonedDayAndMinutes(date: Date, timeZone: string): { day: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    timeZone,
    weekday: 'short'
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  const day = get('weekday').slice(0, 3).toLowerCase() as Weekday

  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

/** Returns undefined when hours are not configured, so no status is ever guessed. */
export function getOpenStatus(rules: OpeningHoursRule[], now: Date, timeZone: string): 'open' | 'closed' | undefined {
  if (!hasOpeningHours(rules)) {
    return undefined
  }

  const { day, minutes } = getZonedDayAndMinutes(now, timeZone)
  const isOpen = rules.some(
    (rule) =>
      rule.days.includes(day) &&
      rule.slots.filter(isValidSlot).some((slot) => {
        const opens = toMinutes(slot.opens) as number
        const closes = toMinutes(slot.closes) as number
        return minutes >= opens && minutes < closes
      })
  )

  return isOpen ? 'open' : 'closed'
}
