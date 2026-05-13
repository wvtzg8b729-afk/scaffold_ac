'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createServerAction } from './actions'

export function CreateServerForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [shownKey, setShownKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await createServerAction(name)
      if ('error' in res) {
        setError('Kunne ikke oprette server.')
        return
      }
      setShownKey(res.apiKey)
      setName('')
      router.refresh()
    })
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-3 text-sm font-medium text-slate-200">Opret server</h2>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-slate-400">Navn</label>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fx. Public #1"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {pending ? 'Opretter…' : 'Opret'}
        </button>
      </form>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      {shownKey ? (
        <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">
          <p className="mb-1 font-semibold">API-nøgle (vises kun én gang — kopiér nu):</p>
          <code className="block break-all rounded bg-black/40 p-2 text-[11px]">{shownKey}</code>
          <button
            type="button"
            className="mt-2 text-amber-200 underline"
            onClick={() => setShownKey(null)}
          >
            Jeg har gemt nøglen
          </button>
        </div>
      ) : null}
    </div>
  )
}
