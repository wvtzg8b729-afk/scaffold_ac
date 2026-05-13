'use client'

import { useMemo, useState, useTransition } from 'react'
import type { AcConfig } from '@/lib/ac-config'
import { updateServerConfigAction } from '@/app/dashboard/actions'

type Tab = 'movement' | 'weapons' | 'entities' | 'webhooks'

const tabs: { id: Tab; label: string }[] = [
  { id: 'movement', label: 'Movement' },
  { id: 'weapons', label: 'Våben' },
  { id: 'entities', label: 'Entities' },
  { id: 'webhooks', label: 'Webhooks' },
]

export function ConfigEditor({ serverId, initial }: { serverId: string; initial: AcConfig }) {
  const [cfg, setCfg] = useState<AcConfig>(initial)
  const [tab, setTab] = useState<Tab>('movement')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const blacklistText = useMemo(
    () => cfg.entities.blacklistedModels.join('\n'),
    [cfg.entities.blacklistedModels]
  )

  function save() {
    setMsg(null)
    setErr(null)
    start(async () => {
      const res = await updateServerConfigAction(serverId, cfg)
      if ('error' in res) {
        setErr('Kunne ikke gemme.')
        return
      }
      setMsg('Gemt.')
    })
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="lg:w-48">
        <nav className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm ${
                tab === t.id ? 'bg-emerald-600/20 text-emerald-200' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="min-h-[240px] flex-1 space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        {tab === 'movement' ? (
          <div className="space-y-3">
            <Toggle
              label="Speedhack (stub log)"
              checked={cfg.movement.speedHack}
              onChange={(v) => setCfg({ ...cfg, movement: { ...cfg.movement, speedHack: v } })}
            />
            <Toggle
              label="Noclip (stub log)"
              checked={cfg.movement.noclip}
              onChange={(v) => setCfg({ ...cfg, movement: { ...cfg.movement, noclip: v } })}
            />
          </div>
        ) : null}
        {tab === 'weapons' ? (
          <div className="space-y-3">
            <Toggle
              label="Spawn check (stub log)"
              checked={cfg.weapons.spawnCheck}
              onChange={(v) => setCfg({ ...cfg, weapons: { ...cfg.weapons, spawnCheck: v } })}
            />
            <Toggle
              label="Damage modifier (stub log)"
              checked={cfg.weapons.damageModifier}
              onChange={(v) => setCfg({ ...cfg, weapons: { ...cfg.weapons, damageModifier: v } })}
            />
          </div>
        ) : null}
        {tab === 'entities' ? (
          <div className="space-y-3">
            <Toggle
              label="Entity spam (stub log)"
              checked={cfg.entities.entitySpam}
              onChange={(v) => setCfg({ ...cfg, entities: { ...cfg.entities, entitySpam: v } })}
            />
            <div>
              <label className="mb-1 block text-xs text-slate-400">Blacklist modeller (én pr. linje)</label>
              <textarea
                className="min-h-[120px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono"
                value={blacklistText}
                onChange={(e) =>
                  setCfg({
                    ...cfg,
                    entities: {
                      ...cfg.entities,
                      blacklistedModels: e.target.value
                        .split('\n')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </div>
          </div>
        ) : null}
        {tab === 'webhooks' ? (
          <div className="space-y-3">
            <Field
              label="Base webhook URL"
              value={cfg.webhooks.url}
              onChange={(v) => setCfg({ ...cfg, webhooks: { ...cfg.webhooks, url: v } })}
            />
            <Field
              label="Ban webhook"
              value={cfg.webhooks.banWebhook}
              onChange={(v) => setCfg({ ...cfg, webhooks: { ...cfg.webhooks, banWebhook: v } })}
            />
            <Field
              label="Alert webhook"
              value={cfg.webhooks.alertWebhook}
              onChange={(v) => setCfg({ ...cfg, webhooks: { ...cfg.webhooks, alertWebhook: v } })}
            />
          </div>
        ) : null}
        <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {pending ? 'Gemmer…' : 'Gem konfiguration'}
          </button>
          {msg ? <span className="text-xs text-emerald-400">{msg}</span> : null}
          {err ? <span className="text-xs text-red-400">{err}</span> : null}
        </div>
      </section>
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
      <span className="text-sm text-slate-200">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-400">{label}</label>
      <input
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
