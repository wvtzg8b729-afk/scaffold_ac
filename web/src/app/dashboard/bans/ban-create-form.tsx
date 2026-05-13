'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createBanAction } from '@/app/dashboard/actions'

type S = { id: string; name: string }

export function BanCreateForm({ servers }: { servers: S[] }) {
  const router = useRouter()
  const [serverId, setServerId] = useState(servers[0]?.id ?? '')
  const [identifiers, setIdentifiers] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  if (servers.length === 0) {
    return <p className="text-sm text-slate-500">Opret først en server under Panel.</p>
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await createBanAction({ serverId, identifiers, reason })
      if ('error' in res) {
        setError(res.error === 'Angiv mindst én identifier' ? res.error : 'Kunne ikke oprette ban.')
        return
      }
      setIdentifiers('')
      setReason('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="text-sm font-medium text-slate-200">Ny ban</h2>
      <div>
        <label className="mb-1 block text-xs text-slate-400">Server</label>
        <select
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          value={serverId}
          onChange={(e) => setServerId(e.target.value)}
        >
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400">Identifiers (komma eller linjeskift)</label>
        <textarea
          className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono"
          value={identifiers}
          onChange={(e) => setIdentifiers(e.target.value)}
          placeholder="license:abc..., fivem:123..."
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400">Årsag</label>
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? 'Gemmer…' : 'Opret ban'}
      </button>
    </form>
  )
}
