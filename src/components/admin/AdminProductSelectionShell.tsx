'use client'

import type React from 'react'

import { MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function AdminProductSelectionShell({ children }: { children: React.ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null)
  const [selectedCount, setSelectedCount] = useState(0)

  useEffect(() => {
    const shell = shellRef.current

    if (!shell) {
      return
    }

    const rows = () => [...shell.querySelectorAll<HTMLInputElement>('input[name="productSelection"]')]
    const selectAll = () => shell.querySelector<HTMLInputElement>('input[name="productSelectionAll"]')

    const sync = () => {
      const rowInputs = rows()
      const checkedCount = rowInputs.filter((input) => input.checked).length
      const allInput = selectAll()

      setSelectedCount(checkedCount)

      if (allInput) {
        allInput.checked = rowInputs.length > 0 && checkedCount === rowInputs.length
        allInput.indeterminate = checkedCount > 0 && checkedCount < rowInputs.length
      }

      rowInputs.forEach((input) => {
        input.closest('tr')?.classList.toggle('is-selected', input.checked)
      })
    }

    const handleChange = (event: Event) => {
      const target = event.target

      if (!(target instanceof HTMLInputElement)) {
        return
      }

      if (target.name === 'productSelectionAll') {
        rows().forEach((input) => {
          input.checked = target.checked
        })
      }

      sync()
    }

    shell.addEventListener('change', handleChange)
    sync()

    return () => shell.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="amous-selection-shell" ref={shellRef}>
      <div aria-live="polite" className={`amous-bulk-toolbar${selectedCount > 0 ? ' is-visible' : ''}`}>
        <strong>{selectedCount} produit{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}</strong>
        <button disabled title="Action groupée à connecter aux opérations Payload" type="button">
          Modifier le prix
        </button>
        <button disabled title="Action groupée à connecter aux opérations Payload" type="button">
          Modifier le stock
        </button>
        <button disabled title="Action groupée à connecter aux opérations Payload" type="button">
          Activer
        </button>
        <button disabled title="Action groupée à connecter aux opérations Payload" type="button">
          Désactiver
        </button>
        <button aria-label="Plus d'actions groupées" disabled title="Action groupée à connecter aux opérations Payload" type="button">
          <MoreHorizontal aria-hidden="true" size={16} />
        </button>
      </div>
      {children}
    </div>
  )
}
