import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyApiKey } from '@/lib/api-key'
import { parseAcConfig, stringifyAcConfig, type AcConfig } from '@/lib/ac-config'

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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorize(req, params.id)
  if ('error' in auth) return auth.error
  const snap = await prisma.configSnapshot.findUnique({ where: { serverId: auth.server.id } })
  const cfg = parseAcConfig(snap?.json)
  return new NextResponse(stringifyAcConfig(cfg), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authorize(req, params.id)
  if ('error' in auth) return auth.error
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Expected object' }, { status: 400 })
  }
  const merged = parseAcConfig(JSON.stringify(body))
  const prev = parseAcConfig(
    (await prisma.configSnapshot.findUnique({ where: { serverId: auth.server.id } }))?.json
  )
  const nextCfg: AcConfig = {
    movement: { ...prev.movement, ...merged.movement },
    weapons: { ...prev.weapons, ...merged.weapons },
    entities: {
      ...prev.entities,
      ...merged.entities,
      blacklistedModels: merged.entities.blacklistedModels ?? prev.entities.blacklistedModels,
    },
    webhooks: { ...prev.webhooks, ...merged.webhooks },
  }
  await prisma.configSnapshot.upsert({
    where: { serverId: auth.server.id },
    create: {
      serverId: auth.server.id,
      json: stringifyAcConfig(nextCfg),
    },
    update: {
      json: stringifyAcConfig(nextCfg),
    },
  })
  return new NextResponse(stringifyAcConfig(nextCfg), {
    status: 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}
