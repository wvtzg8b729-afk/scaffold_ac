import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { parseAcConfig } from '@/lib/ac-config'
import { ConfigEditor } from './config-editor'

export default async function ServerDetailPage({ params }: { params: { id: string } }) {
  const server = await prisma.server.findUnique({
    where: { id: params.id },
    include: { config: true },
  })
  if (!server) notFound()

  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const cfgUrl = `${base}/api/servers/${server.id}/config`
  const initial = parseAcConfig(server.config?.json)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300">
          ← Tilbage
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{server.name}</h1>
        <p className="mt-1 text-xs text-slate-500">Server-id (til convar ac_server_id):</p>
        <code className="mt-1 block max-w-full overflow-x-auto rounded bg-black/50 p-2 text-[11px] text-slate-200">
          {server.id}
        </code>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
        <p className="mb-1 font-medium text-slate-100">FiveM API (GET konfiguration)</p>
        <code className="block break-all text-xs text-emerald-300/90">{cfgUrl}</code>
        <p className="mt-2 text-xs text-slate-500">
          Brug header <span className="text-slate-300">Authorization: Bearer &lt;api-nøgle&gt;</span>. Nøglen vises kun ved oprettelse.
        </p>
      </div>
      <ConfigEditor serverId={server.id} initial={initial} />
    </div>
  )
}
