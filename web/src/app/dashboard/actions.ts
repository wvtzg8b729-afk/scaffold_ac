'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { isAdminSession } from '@/lib/session'
import { generateApiKey, hashApiKey } from '@/lib/api-key'
import { defaultAcConfig, stringifyAcConfig, type AcConfig } from '@/lib/ac-config'

export async function createServerAction(name: string) {
  if (!(await isAdminSession())) return { error: 'Ikke logget ind.' as const }
  const trimmed = name.trim()
  if (!trimmed) return { error: 'Angiv et servernavn.' as const }

  const plain = generateApiKey()
  const apiKeyHash = await hashApiKey(plain)

  try {
    const server = await prisma.server.create({
      data: {
        name: trimmed,
        apiKeyHash,
        config: {
          create: { json: stringifyAcConfig(structuredClone(defaultAcConfig)) },
        },
      },
    })
    revalidatePath('/dashboard')
    return { id: server.id, apiKey: plain }
  } catch (err) {
    console.error('createServerAction', err)
    return { error: 'Kunne ikke oprette server (databasefejl).' as const }
  }
}

export async function updateServerConfigAction(serverId: string, cfg: AcConfig) {
  if (!(await isAdminSession())) return { error: 'Unauthorized' as const }
  const exists = await prisma.server.findUnique({ where: { id: serverId } })
  if (!exists) return { error: 'Not found' as const }
  await prisma.configSnapshot.upsert({
    where: { serverId },
    create: { serverId, json: stringifyAcConfig(cfg) },
    update: { json: stringifyAcConfig(cfg) },
  })
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/servers/${serverId}`)
  return { ok: true as const }
}

function parseIdentifiers(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function createBanAction(input: { serverId: string; identifiers: string; reason: string }) {
  if (!(await isAdminSession())) return { error: 'Unauthorized' as const }
  const server = await prisma.server.findUnique({ where: { id: input.serverId } })
  if (!server) return { error: 'Server ikke fundet' as const }
  const ids = parseIdentifiers(input.identifiers)
  if (ids.length === 0) return { error: 'Angiv mindst én identifier' as const }
  await prisma.ban.create({
    data: {
      serverId: input.serverId,
      identifiers: JSON.stringify(ids),
      reason: input.reason.trim() || 'Ingen årsag',
      active: true,
    },
  })
  revalidatePath('/dashboard/bans')
  return { ok: true as const }
}

export async function setBanActiveAction(banId: string, active: boolean) {
  if (!(await isAdminSession())) return { error: 'Unauthorized' as const }
  await prisma.ban.update({
    where: { id: banId },
    data: { active },
  })
  revalidatePath('/dashboard/bans')
  return { ok: true as const }
}
