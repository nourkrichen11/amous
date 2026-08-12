import {
  Archive,
  BadgePercent,
  Boxes,
  FileImage,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  Package,
  ShoppingCart,
  Truck,
  Users
} from 'lucide-react'

export type NavItem = {
  breadcrumbLabel?: string
  href: string
  icon: typeof LayoutDashboard
  label: string
}

export type NavSection = {
  items: NavItem[]
  label: string
}

export const adminNavSections: NavSection[] = [
  {
    items: [{ href: '/admin', icon: LayoutDashboard, label: "Vue d'ensemble" }],
    label: ''
  },
  {
    items: [
      { href: '/admin/collections/orders', icon: ShoppingCart, label: 'Commandes' },
      { href: '/admin/collections/returns', icon: Archive, label: 'Retours' },
      { href: '/admin/collections/users', icon: Users, label: 'Clients' }
    ],
    label: 'Ventes'
  },
  {
    items: [
      { href: '/admin/collections/products', icon: Package, label: 'Produits' },
      { href: '/admin/collections/categories', icon: Boxes, label: 'Categories' },
      { href: '/admin/collections/brands', icon: BadgePercent, label: 'Marques' },
      { href: '/admin/collections/stock-movements', icon: Archive, label: 'Stock' }
    ],
    label: 'Catalogue'
  },
  {
    items: [
      { href: '/admin/collections/promotions', icon: BadgePercent, label: 'Promotions' },
      { href: '/admin/collections/coupon-codes', icon: Megaphone, label: 'Codes promo' },
      { href: '/admin/globals/homepage', icon: LayoutDashboard, label: "Page d'accueil" },
      { href: '/admin/collections/hero-slides', icon: FileImage, label: 'Bannieres' },
      { href: '/admin/collections/media', icon: FileImage, label: 'Medias' }
    ],
    label: 'Marketing et contenu'
  },
  {
    items: [
      { href: '/admin/collections/shipments', icon: Truck, label: 'Expeditions' },
      { href: '/admin/collections/delivery-zones', icon: MapPinned, label: 'Zones et tarifs' },
      { href: '/admin/collections/carriers', icon: Truck, label: 'Transporteurs' },
      { href: '/admin/globals/site-settings', icon: Boxes, label: 'Boutique' },
      { href: '/admin/globals/delivery-config', icon: Truck, label: 'Livraison' },
      { href: '/admin/collections/audit-logs', icon: Archive, label: "Journal d'activite" }
    ],
    label: 'Configuration'
  }
]

export function isCurrentPath(pathname: string, href: string) {
  return href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

export function getAdminRouteContext(pathname: string) {
  for (const section of adminNavSections) {
    for (const item of section.items) {
      if (isCurrentPath(pathname, item.href)) {
        return {
          breadcrumb: section.label ? `${section.label} / ${item.breadcrumbLabel || item.label}` : item.breadcrumbLabel || item.label,
          item,
          label: item.label,
          sectionLabel: section.label
        }
      }
    }
  }

  if (pathname.startsWith('/admin/account')) {
    return {
      breadcrumb: 'Compte / Mon profil',
      label: 'Mon profil',
      sectionLabel: 'Compte'
    }
  }

  return {
    breadcrumb: 'Administration',
    label: 'Administration',
    sectionLabel: ''
  }
}
