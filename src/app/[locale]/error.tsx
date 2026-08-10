'use client'

import { useEffect } from 'react'

type ErrorProps = {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="container-page py-12 text-center">
      <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
      <p className="mt-3 text-[var(--color-text-muted)]">La page n’a pas pu être chargée correctement.</p>
      <button className="mt-6 min-h-[var(--touch-target)] rounded-md bg-[var(--color-primary)] px-5 font-semibold text-white" onClick={reset} type="button">
        Réessayer
      </button>
    </main>
  )
}
