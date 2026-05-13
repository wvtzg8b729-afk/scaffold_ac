import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyApiKey } from '@/lib/api-key'

function bearer(req: NextRequest) {
  const a = req.headers.get('authorization')
  if (!a?.toLowerCase().startsWith('bearer ')) return null
  return a.slice(7).trim()
}

async function authorize(req: NextRequest, serverId: string) {
  const key = bearer(req)
  if (!key) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const server = await prisma.server.findUnique({ where: { id: serverId } })
  if (!server) return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) }
  const ok = await verifyApiKey(key, server.apiKeyHash)
  if (!ok) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  return { server }
}

function parseIdentifiers(raw: string): string[] {
  try {
    const v = JSON.parse(raw)
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string')
  } catch {
    /* fall through */
  }
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** GET aktive bans — bruges af FiveM-resourcen til at blokere ved connect. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorize(req, params.id)
  if ('error' in auth) return auth.error
  const bans = await prisma.ban.findMany({
    where: { serverId: auth.server.id, active: true },
    orderBy: { createdAt: 'desc' },
  })
  const payload = bans.map((b) => ({
    id: b.id,
    identifiers: parseIdentifiers(b.identifiers),
    reason: b.reason,
    createdAt: b.createdAt.toISOString(),
  }))
  return NextResponse.json(payload, {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

/** POST opretter ban fra FiveM-resourcen (fx via /acban-kommando). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorize(req, params.id)
  if ('error' in auth) return auth.error
  let body: { identifiers?: unknown; reason?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const ids =
    Array.isArray(body.identifiers) ?
      body.identifiers.filter((x): x is string => typeof x === 'string' && x.trim() !== '')
    : []
  if (ids.length === 0) {
    return NextResponse.json({ error: 'identifiers required' }, { status: 400 })
  }
  const reason = typeof body.reason === 'string' && body.reason.trim() ? body.reason.trim() : 'Ingen årsag'
  const ban = await prisma.ban.create({
    data: {
      serverId: auth.server.id,
      identifiers: JSON.stringify(ids),
      reason,
      active: true,
    },
  })
  return NextResponse.json(
    {
      id: ban.id,
      identifiers: ids,
      reason: ban.reason,
      createdAt: ban.createdAt.toISOString(),
    },
    { status: 201 }
  )
}
