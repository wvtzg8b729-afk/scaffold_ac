import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { CreateServerForm } from './create-server-form'

export default async function DashboardPage() {
  const servers = await prisma.server.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Servere</h1>
        <p className="mt-1 text-sm text-slate-400">
          Opret en server for at få et API-id og en nøgle. FiveM-ressourcen henter konfiguration med nøglen.
        </p>
      </div>
      <CreateServerForm />
      <div>
        <h2 className="mb-3 text-sm font-medium text-slate-300">Eksisterende servere</h2>
        {servers.length === 0 ? (
          <p className="text-sm text-slate-500">Ingen servere endnu.</p>
        ) : (
          <ul className="space-y-2">
            {servers.map((s) => (
              <li
                key={s.id}
                className="flex flex-col justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="font-medium text-slate-100">{s.name}</div>
                  <div className="text-xs text-slate-500">Id: {s.id}</div>
                </div>
                <Link
                  href={`/dashboard/servers/${s.id}`}
                  className="text-sm text-emerald-400 hover:underline"
                >
                  Redigér konfiguration
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
