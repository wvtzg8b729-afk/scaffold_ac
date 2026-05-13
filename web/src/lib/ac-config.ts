/** Default AC config shape (JSON) — keep in sync with FiveM `Config.DefaultRemoteConfig`. */

export type AcConfig = {
  movement: { speedHack: boolean; noclip: boolean }
  weapons: { spawnCheck: boolean; damageModifier: boolean }
  entities: { entitySpam: boolean; blacklistedModels: string[] }
  webhooks: { url: string; banWebhook: string; alertWebhook: string }
}

export const defaultAcConfig: AcConfig = {
  movement: { speedHack: false, noclip: false },
  weapons: { spawnCheck: false, damageModifier: false },
  entities: { entitySpam: false, blacklistedModels: [] },
  webhooks: { url: '', banWebhook: '', alertWebhook: '' },
}

export function parseAcConfig(raw: string | null | undefined): AcConfig {
  if (!raw) return structuredClone(defaultAcConfig)
  try {
    const v = JSON.parse(raw) as Partial<AcConfig>
    return {
      movement: { ...defaultAcConfig.movement, ...v.movement },
      weapons: { ...defaultAcConfig.weapons, ...v.weapons },
      entities: {
        ...defaultAcConfig.entities,
        ...v.entities,
        blacklistedModels:
          Array.isArray(v.entities?.blacklistedModels) ?
            (v.entities!.blacklistedModels as string[])
          : defaultAcConfig.entities.blacklistedModels,
      },
      webhooks: { ...defaultAcConfig.webhooks, ...v.webhooks },
    }
  } catch {
    return structuredClone(defaultAcConfig)
  }
}

export function stringifyAcConfig(cfg: AcConfig) {
  return JSON.stringify(cfg, null, 2)
}
