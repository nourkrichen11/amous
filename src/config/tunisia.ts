export type TunisiaGovernorateCode =
  | 'ariana'
  | 'beja'
  | 'ben-arous'
  | 'bizerte'
  | 'gabes'
  | 'gafsa'
  | 'jendouba'
  | 'kairouan'
  | 'kasserine'
  | 'kebili'
  | 'le-kef'
  | 'mahdia'
  | 'manouba'
  | 'medenine'
  | 'monastir'
  | 'nabeul'
  | 'sfax'
  | 'sidi-bouzid'
  | 'siliana'
  | 'sousse'
  | 'tataouine'
  | 'tozeur'
  | 'tunis'
  | 'zaghouan'

export type TunisiaGovernorate = {
  code: TunisiaGovernorateCode
  label: string
}

export const tunisiaGovernorates = [
  { code: 'ariana', label: 'Ariana' },
  { code: 'beja', label: 'Beja' },
  { code: 'ben-arous', label: 'Ben Arous' },
  { code: 'bizerte', label: 'Bizerte' },
  { code: 'gabes', label: 'Gabes' },
  { code: 'gafsa', label: 'Gafsa' },
  { code: 'jendouba', label: 'Jendouba' },
  { code: 'kairouan', label: 'Kairouan' },
  { code: 'kasserine', label: 'Kasserine' },
  { code: 'kebili', label: 'Kebili' },
  { code: 'le-kef', label: 'Le Kef' },
  { code: 'mahdia', label: 'Mahdia' },
  { code: 'manouba', label: 'Manouba' },
  { code: 'medenine', label: 'Medenine' },
  { code: 'monastir', label: 'Monastir' },
  { code: 'nabeul', label: 'Nabeul' },
  { code: 'sfax', label: 'Sfax' },
  { code: 'sidi-bouzid', label: 'Sidi Bouzid' },
  { code: 'siliana', label: 'Siliana' },
  { code: 'sousse', label: 'Sousse' },
  { code: 'tataouine', label: 'Tataouine' },
  { code: 'tozeur', label: 'Tozeur' },
  { code: 'tunis', label: 'Tunis' },
  { code: 'zaghouan', label: 'Zaghouan' }
] as const satisfies readonly TunisiaGovernorate[]

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replaceAll(/\s+/g, '-')
}

export function getGovernorateByCode(code: string) {
  return tunisiaGovernorates.find((governorate) => governorate.code === code)
}

export function getGovernorateByLabel(label: string) {
  const normalized = normalize(label)
  return tunisiaGovernorates.find((governorate) => normalize(governorate.label) === normalized)
}

export function getGovernorateLabel(codeOrLabel: string) {
  return getGovernorateByCode(codeOrLabel)?.label ?? getGovernorateByLabel(codeOrLabel)?.label ?? codeOrLabel
}

export function isValidGovernorate(value: string) {
  return Boolean(getGovernorateByCode(value) || getGovernorateByLabel(value))
}

export function governorateOptions() {
  return tunisiaGovernorates.map((governorate) => ({
    label: governorate.label,
    value: governorate.code
  }))
}
