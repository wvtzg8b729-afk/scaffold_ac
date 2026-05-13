import { prisma } from '@/lib/prisma'
import { BanCreateForm } from './ban-create-form'
import { BanRowActions } from './ban-row-actions'

export default async function BansPage() {
  const [servers, bans] = await Promise.all([
    prisma.server.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, name: true } }),
    prisma.ban.findMany({
      orderBy: { createdAt: 'desc' },
      include: { server: { select: { name: true } } },
    }),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Bans</h1>
        <p className="mt-1 text-sm text-slate-400">Enkel liste over aktive/inaktive bans (MVP — ikke wired til FiveM endnu).</p>
      </div>
      <BanCreateForm servers={servers} />
      <div>
        <h2 className="mb-3 text-sm font-medium text-slate-300">Liste</h2>
        {bans.length === 0 ? (
          <p className="text-sm text-slate-500">Ingen bans.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Server</th>
                  <th className="px-3 py-2">Årsag</th>
                  <th className="px-3 py-2">Identifiers</th>
                  <th className="px-3 py-2">Oprettet</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bans.map((b) => {
                  let ids = b.identifiers
                  try {
                    const parsed = JSON.parse(b.identifiers) as unknown
                    if (Array.isArray(parsed)) ids = parsed.join(', ')
                  } catch {
                    /* keep raw */
                  }
                  return (
                    <tr key={b.id} className="bg-slate-950/40">
                      <td className="px-3 py-2 text-slate-200">{b.server.name}</td>
                      <td className="px-3 py-2 text-slate-300">{b.reason}</td>
                      <td className="max-w-xs truncate px-3 py-2 text-xs text-slate-500" title={ids}>
                        {ids}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                        {b.createdAt.toISOString().slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="px-3 py-2 text-xs">{b.active ? 'Aktiv' : 'Inaktiv'}</td>
                      <td className="px-3 py-2">
                        <BanRowActions banId={b.id} active={b.active} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
