'use client'

import { useTransition } from 'react'
import { setBanActiveAction } from '@/app/dashboard/actions'

export function BanRowActions({ banId, active }: { banId: string; active: boolean }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => {
        await setBanActiveAction(banId, !active)
      })}
      className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-50"
    >
      {active ? 'Deaktivér' : 'Aktivér'}
    </button>
  )
}
