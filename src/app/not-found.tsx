import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="container-page grid min-h-screen place-items-center py-16 text-center">
      <div>
        <p className="mb-2 text-sm font-semibold text-[var(--color-primary)]">404</p>
        <h1 className="text-3xl font-bold">Page introuvable</h1>
        <p className="mt-3 text-[var(--color-text-muted)]">Cette page n’existe pas ou n’est plus disponible.</p>
        <Link
          className="mt-6 inline-flex min-h-[var(--touch-target)] items-center rounded-md bg-[var(--color-primary)] px-5 text-white"
          href="/fr"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  )
}
