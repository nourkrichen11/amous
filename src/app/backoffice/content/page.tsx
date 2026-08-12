import Link from 'next/link'

import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

const contentLinks = [
  { description: 'Hero, categories, produits, marques et avantages affiches sur la page d accueil.', href: '/admin/globals/homepage', label: 'Page d accueil' },
  { description: 'Slides hero publies avec dates, images desktop/mobile et appels a action.', href: '/admin/collections/hero-slides', label: 'Bannieres' },
  { description: 'Images produits, logos, icones de categories et visuels de contenu.', href: '/admin/collections/media', label: 'Medias' },
  { description: 'Navigation, annonce, recherche et options du header public.', href: '/admin/globals/header', label: 'Header' }
]

export default function BackofficeContentPage() {
  return (
    <div className="space-y-5">
      <AdminPageHeader title="Contenu" />
      <div className="grid gap-3 lg:grid-cols-2">
        {contentLinks.map((link) => (
          <Link className="rounded-md border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42_/_0.04)] hover:border-blue-200 hover:bg-blue-50" href={link.href} key={link.href}>
            <h2 className="font-semibold text-[#101827]">{link.label}</h2>
            <p className="mt-1 text-sm text-slate-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
