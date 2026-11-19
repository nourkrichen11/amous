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
      { href: '/admin/collections/categories', icon: Boxes, label: 'Catégories' },
      { href: '/admin/collections/brands', icon: BadgePercent, label: 'Marques' },
      {
        breadcrumbLabel: 'Stock',
        href: '/admin/collections/products?where[stockStatus][not_equals]=in_stock&sort=availableStock',
        icon: Archive,
        label: 'Stock'
      }
    ],
    label: 'Catalogue'
  },
  {
    items: [
      { href: '/admin/collections/promotions', icon: BadgePercent, label: 'Promotions' },
      { href: '/admin/collections/coupon-codes', icon: Megaphone, label: 'Codes promo' },
      { href: '/admin/globals/homepage', icon: LayoutDashboard, label: "Page d'accueil" },
      { href: '/admin/collections/hero-slides', icon: FileImage, label: 'Bannières' },
      { href: '/admin/collections/media', icon: FileImage, label: 'Médias' }
    ],
    label: 'Marketing et contenu'
  },
  {
    items: [
      { href: '/admin/collections/shipments', icon: Truck, label: 'Expéditions' },
      { href: '/admin/collections/delivery-zones', icon: MapPinned, label: 'Zones et tarifs' },
      { href: '/admin/collections/carriers', icon: Truck, label: 'Transporteurs' },
      { href: '/admin/globals/site-settings', icon: Boxes, label: 'Boutique' },
      { href: '/admin/globals/delivery-config', icon: Truck, label: 'Livraison' },
      { href: '/admin/collections/stock-movements', icon: Archive, label: 'Journal de stock' },
      { href: '/admin/collections/audit-logs', icon: Archive, label: "Journal d'activité" }
    ],
    label: 'Configuration'
  }
]

/**
 * `next/navigation`'s `usePathname()` never includes the query string, so a
 * nav item whose href carries one (e.g. the "Stock" shortcut into a filtered
 * Products view) can never match on pathname alone. Callers pass the full
 * `pathname[?search]` as `currentUrl` so those hrefs can match exactly, while
 * hrefs without a query string keep matching by pathname/prefix as before.
 */
export function isCurrentPath(currentUrl: string, href: string) {
  const [hrefPath, hrefQuery] = href.split('?')
  const currentPath = currentUrl.split('?')[0]

  if (hrefQuery) {
    return currentUrl === href
  }

  return hrefPath === '/admin' ? currentPath === hrefPath : currentPath === hrefPath || currentPath.startsWith(`${hrefPath}/`)
}

export function getAdminRouteContext(currentUrl: string) {
  const pathname = currentUrl.split('?')[0]

  for (const section of adminNavSections) {
    for (const item of section.items) {
      if (isCurrentPath(currentUrl, item.href)) {
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
