import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

import { amousCategoryDefinitions } from '@/features/catalogue/categoryContent'

const outputDirectory = path.resolve('public/images/categories')

type IconSpec = {
  accent?: string
  shapes: string
}

const navy = '#0F3765'
const lightBlue = '#DCEAF6'
const red = '#E30613'
const graphite = '#303846'
const steel = '#B9C7D3'
const green = '#2E7D58'
const yellow = '#F3B33E'

function rotate(cx: number, cy: number, angle: number) {
  return `transform="rotate(${angle} ${cx} ${cy})"`
}

const iconSpecs: Record<string, IconSpec> = {
  'outillage-a-main': {
    shapes: `
      <g ${rotate(430, 450, -18)}>
        <rect x="395" y="300" width="70" height="265" rx="24" fill="${red}"/>
        <rect x="360" y="265" width="145" height="62" rx="24" fill="${graphite}"/>
        <rect x="480" y="278" width="70" height="38" rx="18" fill="${graphite}"/>
      </g>
      <g ${rotate(610, 445, 16)}>
        <rect x="580" y="285" width="60" height="285" rx="22" fill="${red}"/>
        <circle cx="610" cy="270" r="42" fill="${graphite}"/>
        <circle cx="610" cy="270" r="20" fill="#F8FAFC"/>
      </g>
      <g ${rotate(760, 440, 9)}>
        <rect x="730" y="285" width="58" height="300" rx="20" fill="${graphite}"/>
        <path d="M716 246h86l-18 76h-50z" fill="${steel}"/>
      </g>
    `
  },
  quincaillerie: {
    shapes: `
      <rect x="380" y="370" width="150" height="120" rx="18" fill="${steel}"/>
      <rect x="405" y="345" width="100" height="34" rx="12" fill="${graphite}"/>
      <circle cx="455" cy="430" r="20" fill="${navy}"/>
      <rect x="610" y="292" width="120" height="285" rx="22" fill="${red}"/>
      <circle cx="670" cy="575" r="64" fill="${red}"/>
      <circle cx="670" cy="575" r="34" fill="#F8FAFC"/>
      <path d="M610 302h120l-24-50h-72z" fill="${graphite}"/>
      <g ${rotate(800, 430, -24)}>
        <rect x="760" y="270" width="80" height="310" rx="24" fill="${graphite}"/>
        <rect x="778" y="294" width="44" height="240" rx="16" fill="${steel}"/>
      </g>
    `
  },
  'outillage-electroportatif': {
    shapes: `
      <g ${rotate(620, 430, -7)}>
        <rect x="430" y="315" width="300" height="130" rx="32" fill="${red}"/>
        <rect x="690" y="350" width="90" height="62" rx="14" fill="${graphite}"/>
        <rect x="500" y="440" width="95" height="165" rx="20" fill="${graphite}"/>
        <rect x="525" y="585" width="135" height="42" rx="18" fill="${red}"/>
        <circle cx="494" cy="380" r="34" fill="${navy}"/>
        <rect x="575" y="343" width="88" height="45" rx="12" fill="${lightBlue}"/>
      </g>
    `
  },
  'mesure-et-controle': {
    shapes: `
      <g ${rotate(545, 435, -23)}>
        <rect x="355" y="380" width="390" height="88" rx="26" fill="${red}"/>
        <rect x="395" y="406" width="230" height="18" rx="9" fill="${lightBlue}"/>
        <rect x="655" y="398" width="56" height="34" rx="10" fill="${navy}"/>
      </g>
      <g ${rotate(745, 430, 18)}>
        <rect x="690" y="300" width="115" height="250" rx="28" fill="${graphite}"/>
        <rect x="715" y="330" width="65" height="78" rx="12" fill="${red}"/>
        <path d="M730 500h34v76h-34z" fill="${steel}"/>
      </g>
    `
  },
  jardinage: {
    shapes: `
      <g ${rotate(460, 455, -18)}>
        <rect x="432" y="330" width="56" height="270" rx="22" fill="${green}"/>
        <path d="M410 288c74 18 122 62 134 132-82-10-133-54-134-132z" fill="${green}"/>
        <path d="M379 356c61 2 105 33 132 91-68 15-117-11-132-91z" fill="${lightBlue}"/>
      </g>
      <g ${rotate(655, 450, 12)}>
        <rect x="632" y="290" width="46" height="305" rx="20" fill="${graphite}"/>
        <path d="M594 270h122l-28 78h-66z" fill="${red}"/>
      </g>
      <path d="M750 560c120-110 230-45 150 35-44 44-109 46-150-35z" fill="${green}"/>
    `
  },
  maison: {
    shapes: `
      <path d="M350 430 600 245l250 185v260H350z" fill="${lightBlue}"/>
      <path d="M318 430 600 220l282 210-40 54-242-178-242 178z" fill="${red}"/>
      <rect x="520" y="500" width="150" height="190" rx="20" fill="${navy}"/>
      <rect x="705" y="500" width="92" height="92" rx="18" fill="#FFFFFF"/>
      <rect x="405" y="500" width="92" height="92" rx="18" fill="#FFFFFF"/>
    `
  },
  'protection-et-securite': {
    shapes: `
      <path d="M600 230c115 0 210 88 218 205H382c8-117 103-205 218-205z" fill="${yellow}"/>
      <rect x="350" y="410" width="500" height="70" rx="30" fill="${graphite}"/>
      <path d="M430 528h340l-52 128H482z" fill="${red}"/>
      <path d="M508 548h184l-34 72H542z" fill="#F8FAFC"/>
    `
  },
  pneumatique: {
    shapes: `
      <rect x="330" y="430" width="270" height="145" rx="36" fill="${red}"/>
      <circle cx="400" cy="590" r="48" fill="${graphite}"/>
      <circle cx="400" cy="590" r="20" fill="#F8FAFC"/>
      <circle cx="530" cy="590" r="48" fill="${graphite}"/>
      <circle cx="530" cy="590" r="20" fill="#F8FAFC"/>
      <rect x="410" y="335" width="390" height="105" rx="36" fill="${graphite}"/>
      <rect x="770" y="365" width="90" height="46" rx="14" fill="${steel}"/>
      <path d="M640 440h90v135h-90z" fill="${navy}"/>
    `
  },
  'manutention-et-levage': {
    shapes: `
      <rect x="325" y="535" width="430" height="54" rx="18" fill="${red}"/>
      <rect x="380" y="455" width="70" height="120" rx="16" fill="${graphite}"/>
      <rect x="690" y="455" width="70" height="120" rx="16" fill="${graphite}"/>
      <circle cx="405" cy="620" r="38" fill="${navy}"/>
      <circle cx="705" cy="620" r="38" fill="${navy}"/>
      <path d="M600 270h160l-30 165H630z" fill="${yellow}"/>
      <path d="M660 270v-60h120" stroke="${graphite}" stroke-width="42" stroke-linecap="round" fill="none"/>
    `
  },
  electricite: {
    shapes: `
      <rect x="380" y="290" width="180" height="300" rx="28" fill="${graphite}"/>
      <rect x="410" y="330" width="120" height="74" rx="14" fill="${lightBlue}"/>
      <rect x="430" y="445" width="80" height="105" rx="14" fill="${red}"/>
      <path d="M675 240 555 470h105l-62 210 180-280H662z" fill="${yellow}"/>
      <path d="M805 315c70 75 70 180 0 255" stroke="${red}" stroke-width="40" stroke-linecap="round" fill="none"/>
    `
  },
  'boulonnerie-visserie': {
    shapes: `
      <g ${rotate(440, 455, -22)}>
        <rect x="350" y="420" width="250" height="58" rx="20" fill="${steel}"/>
        <polygon points="600,420 700,449 600,478" fill="${graphite}"/>
        <rect x="350" y="397" width="46" height="104" rx="16" fill="${navy}"/>
      </g>
      <g ${rotate(710, 455, 18)}>
        <rect x="620" y="410" width="240" height="64" rx="20" fill="${red}"/>
        <polygon points="860,410 950,442 860,474" fill="${graphite}"/>
      </g>
      <circle cx="565" cy="565" r="58" fill="${graphite}"/>
      <circle cx="565" cy="565" r="28" fill="#F8FAFC"/>
    `
  },
  peinture: {
    shapes: `
      <rect x="360" y="360" width="205" height="240" rx="28" fill="${red}"/>
      <ellipse cx="462" cy="360" rx="102" ry="34" fill="${graphite}"/>
      <ellipse cx="462" cy="360" rx="70" ry="18" fill="${lightBlue}"/>
      <g ${rotate(695, 420, -14)}>
        <rect x="615" y="320" width="280" height="70" rx="24" fill="${red}"/>
        <rect x="680" y="385" width="46" height="175" rx="18" fill="${graphite}"/>
        <rect x="642" y="535" width="120" height="48" rx="18" fill="${graphite}"/>
      </g>
    `
  },
  'coupe-et-percage': {
    shapes: `
      <circle cx="455" cy="455" r="130" fill="${steel}"/>
      <circle cx="455" cy="455" r="58" fill="#F8FAFC"/>
      <path d="M455 315v80M455 515v80M315 455h80M515 455h80" stroke="${navy}" stroke-width="26" stroke-linecap="round"/>
      <g ${rotate(720, 445, 20)}>
        <rect x="690" y="250" width="58" height="350" rx="18" fill="${graphite}"/>
        <path d="M690 250h58l-30-70z" fill="${red}"/>
        <path d="M690 595h58l-28 72z" fill="${red}"/>
      </g>
    `
  },
  'pompes-et-generateurs': {
    shapes: `
      <rect x="340" y="360" width="300" height="180" rx="34" fill="${red}"/>
      <circle cx="440" cy="450" r="72" fill="${graphite}"/>
      <circle cx="440" cy="450" r="32" fill="#F8FAFC"/>
      <rect x="615" y="420" width="120" height="70" rx="18" fill="${graphite}"/>
      <path d="M735 455c90 0 90-100 175-100" stroke="${navy}" stroke-width="44" stroke-linecap="round" fill="none"/>
      <rect x="330" y="560" width="470" height="58" rx="22" fill="${steel}"/>
    `
  },
  'materiel-equipement': {
    shapes: `
      <rect x="330" y="350" width="520" height="80" rx="22" fill="${red}"/>
      <rect x="370" y="430" width="56" height="190" rx="16" fill="${graphite}"/>
      <rect x="760" y="430" width="56" height="190" rx="16" fill="${graphite}"/>
      <rect x="485" y="455" width="210" height="110" rx="26" fill="${lightBlue}"/>
      <rect x="522" y="485" width="135" height="32" rx="12" fill="${navy}"/>
      <circle cx="595" cy="312" r="70" fill="${steel}"/>
      <circle cx="595" cy="312" r="28" fill="#F8FAFC"/>
    `
  },
  soudage: {
    shapes: `
      <rect x="365" y="330" width="245" height="250" rx="34" fill="${red}"/>
      <rect x="405" y="375" width="165" height="86" rx="18" fill="${graphite}"/>
      <rect x="430" y="405" width="115" height="24" rx="10" fill="${lightBlue}"/>
      <path d="M605 455c92-70 172-48 220 44" stroke="${graphite}" stroke-width="36" stroke-linecap="round" fill="none"/>
      <path d="M825 500l72 48-72 48-70-48z" fill="${yellow}"/>
      <path d="M842 480l86-64M858 610l96 45" stroke="${red}" stroke-width="26" stroke-linecap="round"/>
    `
  },
  'tuyauterie-et-accessoires': {
    shapes: `
      <path d="M330 430h190v-85h150v85h200v95H570v110H430V525H330z" fill="${steel}"/>
      <rect x="300" y="400" width="260" height="155" rx="38" fill="${red}"/>
      <rect x="645" y="400" width="260" height="155" rx="38" fill="${navy}"/>
      <rect x="510" y="315" width="210" height="120" rx="34" fill="${graphite}"/>
      <circle cx="430" cy="478" r="45" fill="#F8FAFC"/>
      <circle cx="775" cy="478" r="45" fill="#F8FAFC"/>
    `
  },
  abrasifs: {
    shapes: `
      <circle cx="470" cy="450" r="135" fill="${red}"/>
      <circle cx="470" cy="450" r="76" fill="${graphite}"/>
      <circle cx="470" cy="450" r="30" fill="#F8FAFC"/>
      <circle cx="690" cy="450" r="120" fill="${steel}"/>
      <circle cx="690" cy="450" r="58" fill="#F8FAFC"/>
      <path d="M612 360c62 56 100 110 116 178" stroke="${navy}" stroke-width="24" stroke-linecap="round" fill="none"/>
    `
  },
  'ateliers-professionnels': {
    shapes: `
      <rect x="330" y="320" width="540" height="330" rx="34" fill="${graphite}"/>
      <rect x="375" y="365" width="195" height="95" rx="18" fill="${red}"/>
      <rect x="620" y="365" width="195" height="95" rx="18" fill="${steel}"/>
      <rect x="375" y="505" width="440" height="54" rx="18" fill="${lightBlue}"/>
      <circle cx="430" cy="608" r="24" fill="${red}"/>
      <circle cx="500" cy="608" r="24" fill="${red}"/>
      <circle cx="570" cy="608" r="24" fill="${red}"/>
      <circle cx="740" cy="608" r="24" fill="${red}"/>
    `
  }
}

function createSvg({ accent = lightBlue, shapes }: IconSpec) {
  return `
    <svg width="1200" height="900" viewBox="0 0 1200 900" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="900" rx="40" fill="#F8FAFC"/>
      <rect x="130" y="110" width="940" height="680" rx="34" fill="#FFFFFF" stroke="#DCEAF6" stroke-width="6"/>
      <circle cx="945" cy="185" r="42" fill="${accent}" opacity="0.75"/>
      <circle cx="245" cy="700" r="34" fill="${accent}" opacity="0.35"/>
      <g filter="url(#softShadow)">
        ${shapes}
      </g>
      <defs>
        <filter id="softShadow" x="220" y="140" width="760" height="620" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.12"/>
        </filter>
      </defs>
    </svg>
  `
}

async function generateCategoryImages() {
  await mkdir(outputDirectory, { recursive: true })

  for (const category of amousCategoryDefinitions) {
    const spec = iconSpecs[category.slug]

    if (!spec) {
      throw new Error(`Missing icon spec for ${category.slug}`)
    }

    const svg = createSvg(spec)
    const outputPath = path.join(outputDirectory, category.imageFileName)

    const webp = await sharp(Buffer.from(svg)).webp({ quality: 92 }).toBuffer()
    await writeFile(outputPath, webp)
    console.log(`[category-images] generated ${outputPath}`)
  }
}

generateCategoryImages().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
