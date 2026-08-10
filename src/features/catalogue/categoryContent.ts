export type SeedCategoryDefinition = {
  name: string
  slug: string
  shortDescription: string
  imageFileName: string
  imageAlt: string
  imageComposition: string
  seoTitle: string
  seoDescription: string
  displayOrder: number
  featured: boolean
  showOnHomepage: boolean
}

const homepageCategorySlugs = new Set([
  'outillage-a-main',
  'quincaillerie',
  'outillage-electroportatif',
  'electricite',
  'peinture',
  'protection-et-securite',
  'boulonnerie-visserie',
  'jardinage'
])

export const amousCategoryDefinitions: SeedCategoryDefinition[] = [
  {
    name: 'Outillage à main',
    slug: 'outillage-a-main',
    shortDescription: 'Marteaux, tournevis, pinces, clés et outils essentiels pour les travaux quotidiens, l’entretien et les réparations.',
    imageFileName: 'outillage-a-main.webp',
    imageAlt: 'Composition d’outils à main avec marteau, pinces, tournevis et clés sur fond clair.',
    imageComposition: 'Hammer, combination pliers, screwdrivers, adjustable wrench and spanners.',
    seoTitle: 'Outillage à main en Tunisie | Amous Quincaillerie',
    seoDescription: 'Découvrez les marteaux, pinces, tournevis, clés et outils à main disponibles chez Amous Quincaillerie.',
    displayOrder: 1,
    featured: true,
    showOnHomepage: true
  },
  {
    name: 'Quincaillerie',
    slug: 'quincaillerie',
    shortDescription: 'Accessoires de quincaillerie pour portes, fenêtres, meubles, installations et travaux de fixation.',
    imageFileName: 'quincaillerie.webp',
    imageAlt: 'Poignée, cadenas, charnières et accessoires de quincaillerie présentés sur fond très clair.',
    imageComposition: 'Padlock, door handle, hinges, brackets, hooks and small hardware accessories.',
    seoTitle: 'Quincaillerie et accessoires | Amous',
    seoDescription: 'Retrouvez les accessoires de quincaillerie, serrures, charnières, poignées et solutions de fixation chez Amous.',
    displayOrder: 2,
    featured: true,
    showOnHomepage: true
  },
  {
    name: 'Outillage électroportatif',
    slug: 'outillage-electroportatif',
    shortDescription: 'Perceuses, visseuses, meuleuses, scies et machines électroportatives pour les particuliers et les professionnels.',
    imageFileName: 'outillage-electroportatif.webp',
    imageAlt: 'Perceuse sans fil, meuleuse et scie circulaire agencées sur un fond clair avec accents bleus.',
    imageComposition: 'Cordless drill, angle grinder, circular saw and electric screwdriver.',
    seoTitle: 'Outillage électroportatif en Tunisie | Amous',
    seoDescription: 'Achetez vos perceuses, visseuses, meuleuses et scies électriques chez Amous Quincaillerie.',
    displayOrder: 3,
    featured: true,
    showOnHomepage: true
  },
  {
    name: 'Mesure et contrôle',
    slug: 'mesure-et-controle',
    shortDescription: 'Instruments de mesure et de contrôle pour obtenir des résultats précis sur les chantiers et dans les ateliers.',
    imageFileName: 'mesure-et-controle.webp',
    imageAlt: 'Mètre ruban, niveau, pied à coulisse et outils de mesure présentés sur fond clair.',
    imageComposition: 'Measuring tape, spirit level, digital caliper, laser distance meter and square.',
    seoTitle: 'Outils de mesure et de contrôle | Amous',
    seoDescription: 'Niveaux, mètres, pieds à coulisse et appareils de mesure pour professionnels et bricoleurs.',
    displayOrder: 4,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Jardinage',
    slug: 'jardinage',
    shortDescription: 'Outils et équipements pour l’entretien du jardin, la coupe, l’arrosage et les travaux extérieurs.',
    imageFileName: 'jardinage.webp',
    imageAlt: 'Composition d’outils de jardinage avec sécateur, tuyau et accessoires sur fond léger.',
    imageComposition: 'Pruning shears, garden hose, hand trowel, hedge trimmer and watering accessory.',
    seoTitle: 'Outils et matériel de jardinage | Amous',
    seoDescription: 'Découvrez les outils de jardinage, équipements d’arrosage et accessoires d’entretien extérieur chez Amous.',
    displayOrder: 5,
    featured: true,
    showOnHomepage: true
  },
  {
    name: 'Maison',
    slug: 'maison',
    shortDescription: 'Équipements pratiques pour l’entretien, le rangement, la réparation et l’amélioration de la maison.',
    imageFileName: 'maison.webp',
    imageAlt: 'Boîte de rangement, échelle et accessoires maison sur fond clair.',
    imageComposition: 'Storage box, ladder, door accessories, repair tools and utility items.',
    seoTitle: 'Équipement et accessoires pour la maison | Amous',
    seoDescription: 'Solutions pratiques pour entretenir, réparer et équiper votre maison avec Amous.',
    displayOrder: 6,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Protection et sécurité',
    slug: 'protection-et-securite',
    shortDescription: 'Équipements de protection individuelle pour travailler en toute sécurité sur les chantiers et dans les ateliers.',
    imageFileName: 'protection-et-securite.webp',
    imageAlt: 'Casque, gants, lunettes et chaussures de sécurité présentés sur fond clair.',
    imageComposition: 'Safety helmet, protective gloves, safety glasses, hearing protection and safety shoes.',
    seoTitle: 'Équipements de protection et sécurité | Amous',
    seoDescription: 'Casques, gants, lunettes et équipements de sécurité pour professionnels et particuliers.',
    displayOrder: 7,
    featured: true,
    showOnHomepage: true
  },
  {
    name: 'Pneumatique',
    slug: 'pneumatique',
    shortDescription: 'Compresseurs, outils pneumatiques, raccords et accessoires pour les travaux à air comprimé.',
    imageFileName: 'pneumatique.webp',
    imageAlt: 'Compresseur, flexible et outil pneumatique présentés proprement sur fond clair.',
    imageComposition: 'Air compressor, pneumatic impact wrench, air hose, pressure gauge and fittings.',
    seoTitle: 'Compresseurs et outils pneumatiques | Amous',
    seoDescription: 'Compresseurs, outils à air comprimé et accessoires pneumatiques disponibles chez Amous.',
    displayOrder: 8,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Manutention et levage',
    slug: 'manutention-et-levage',
    shortDescription: 'Matériel de levage, de transport et de manutention pour déplacer les charges en sécurité.',
    imageFileName: 'manutention-et-levage.webp',
    imageAlt: 'Cric, palan, chariot et accessoires de levage présentés sur fond clair.',
    imageComposition: 'Hydraulic jack, hand pallet truck, chain hoist, lifting strap and trolley.',
    seoTitle: 'Matériel de manutention et levage | Amous',
    seoDescription: 'Crics, palans, chariots, sangles et équipements de levage pour vos travaux.',
    displayOrder: 9,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Électricité',
    slug: 'electricite',
    shortDescription: 'Matériel électrique pour les installations, réparations, raccordements et équipements domestiques ou professionnels.',
    imageFileName: 'electricite.webp',
    imageAlt: 'Disjoncteur, câble, prise et testeur électrique sur fond très clair.',
    imageComposition: 'Circuit breaker, electrical cable, socket, switch, connector and electrical tester.',
    seoTitle: 'Matériel électrique et accessoires | Amous',
    seoDescription: 'Câbles, prises, interrupteurs, disjoncteurs et accessoires électriques chez Amous.',
    displayOrder: 10,
    featured: true,
    showOnHomepage: true
  },
  {
    name: 'Boulonnerie et visserie',
    slug: 'boulonnerie-visserie',
    shortDescription: 'Vis, boulons, écrous, rondelles et éléments de fixation pour tous types d’assemblage.',
    imageFileName: 'boulonnerie-visserie.webp',
    imageAlt: 'Assortiment de vis, boulons, écrous et rondelles sur fond clair.',
    imageComposition: 'Assorted screws, bolts, nuts, washers, anchors and threaded rods.',
    seoTitle: 'Visserie, boulonnerie et fixation | Amous',
    seoDescription: 'Trouvez vos vis, boulons, écrous, rondelles et accessoires de fixation chez Amous.',
    displayOrder: 11,
    featured: true,
    showOnHomepage: true
  },
  {
    name: 'Peinture',
    slug: 'peinture',
    shortDescription: 'Peintures, rouleaux, pinceaux, rubans et accessoires pour les travaux de finition et de rénovation.',
    imageFileName: 'peinture.webp',
    imageAlt: 'Pot de peinture, rouleau, pinceaux et bac présentés sur fond clair.',
    imageComposition: 'Paint bucket, paint roller, paintbrushes, masking tape and paint tray.',
    seoTitle: 'Peinture et accessoires | Amous Quincaillerie',
    seoDescription: 'Peintures, rouleaux, pinceaux et accessoires pour vos travaux de rénovation.',
    displayOrder: 12,
    featured: true,
    showOnHomepage: true
  },
  {
    name: 'Outils de coupe et perçage',
    slug: 'coupe-et-percage',
    shortDescription: 'Forets, mèches, lames, disques et accessoires pour couper et percer différents matériaux.',
    imageFileName: 'coupe-et-percage.webp',
    imageAlt: 'Forets, scies cloches, lames et disques de coupe sur fond clair.',
    imageComposition: 'Drill bits, hole saws, cutting discs, jigsaw blades and circular saw blade.',
    seoTitle: 'Outils de coupe, forets et perçage | Amous',
    seoDescription: 'Forets, mèches, disques et lames de coupe pour le métal, le bois et les matériaux de construction.',
    displayOrder: 13,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Pompes et générateurs',
    slug: 'pompes-et-generateurs',
    shortDescription: 'Pompes à eau, groupes électrogènes et équipements destinés à l’approvisionnement en eau et en énergie.',
    imageFileName: 'pompes-et-generateurs.webp',
    imageAlt: 'Pompe à eau et groupe électrogène présentés sur fond clair avec détails bleus.',
    imageComposition: 'Water pump, portable generator, pressure pump and connection accessories.',
    seoTitle: 'Pompes à eau et groupes électrogènes | Amous',
    seoDescription: 'Découvrez les pompes, motopompes et groupes électrogènes disponibles chez Amous.',
    displayOrder: 14,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Matériel d’équipement',
    slug: 'materiel-equipement',
    shortDescription: 'Machines et équipements fixes pour aménager et améliorer les ateliers professionnels.',
    imageFileName: 'materiel-equipement.webp',
    imageAlt: 'Établi, étau, touret et mobilier d’atelier sur fond très clair.',
    imageComposition: 'Workbench, bench vise, bench grinder, drill press and workshop cabinet.',
    seoTitle: 'Matériel et équipement d’atelier | Amous',
    seoDescription: 'Établis, étaux, tourets et équipements fixes pour ateliers professionnels.',
    displayOrder: 15,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Soudage et accessoires',
    slug: 'soudage',
    shortDescription: 'Postes à souder, protections, électrodes et accessoires pour les travaux de soudage et d’assemblage.',
    imageFileName: 'soudage.webp',
    imageAlt: 'Poste à souder, masque et gants de soudage sur fond clair.',
    imageComposition: 'Welding machine, welding helmet, electrodes, welding gloves and clamps.',
    seoTitle: 'Postes à souder et accessoires | Amous',
    seoDescription: 'Équipements de soudage, protections, électrodes et accessoires disponibles chez Amous.',
    displayOrder: 16,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Tuyauterie et accessoires',
    slug: 'tuyauterie-et-accessoires',
    shortDescription: 'Tuyaux, raccords, vannes, colliers et accessoires pour les installations hydrauliques et industrielles.',
    imageFileName: 'tuyauterie-et-accessoires.webp',
    imageAlt: 'Tuyaux, raccords et vannes présentés sur fond clair dans une composition propre.',
    imageComposition: 'Pipes, valves, elbows, connectors, clamps and plumbing fittings.',
    seoTitle: 'Tuyauterie, raccords et accessoires | Amous',
    seoDescription: 'Tuyaux, raccords, vannes et accessoires pour vos installations chez Amous.',
    displayOrder: 17,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Abrasifs',
    slug: 'abrasifs',
    shortDescription: 'Disques, feuilles abrasives, meules et accessoires pour poncer, polir, décaper et préparer les surfaces.',
    imageFileName: 'abrasifs.webp',
    imageAlt: 'Disques abrasifs, meules et feuilles de ponçage sur fond clair.',
    imageComposition: 'Sanding discs, flap discs, grinding wheel, sandpaper sheets and abrasive belt.',
    seoTitle: 'Abrasifs, disques et papier de ponçage | Amous',
    seoDescription: 'Disques abrasifs, meules, bandes et papier de ponçage pour tous vos travaux.',
    displayOrder: 18,
    featured: false,
    showOnHomepage: false
  },
  {
    name: 'Ateliers professionnels',
    slug: 'ateliers-professionnels',
    shortDescription: 'Solutions complètes pour organiser et équiper les ateliers, garages et espaces de maintenance professionnels.',
    imageFileName: 'ateliers-professionnels.webp',
    imageAlt: 'Établi professionnel, coffre à outils et rangement d’atelier sur fond très clair.',
    imageComposition: 'Professional workbench, tool cabinet, pegboard, tool chest and organized hand tools.',
    seoTitle: 'Équipement pour ateliers professionnels | Amous',
    seoDescription: 'Équipez votre atelier ou garage avec les solutions professionnelles proposées par Amous.',
    displayOrder: 19,
    featured: false,
    showOnHomepage: false
  }
]

export const homepageCategoryCount = homepageCategorySlugs.size

export function isHomepageCategory(slug: string) {
  return homepageCategorySlugs.has(slug)
}
