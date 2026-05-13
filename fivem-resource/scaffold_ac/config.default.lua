--[[
  Default runtime options. Convars override where noted.
  API base URL og credentials skal sættes via server.cfg convars.
]]

Config = Config or {}

---@type "auto"|"standalone"|"esx"|"qb"|"vrp"
--- Sæt `auto` (anbefalet) for at lade resourcen selv finde frameworket.
Config.Framework = GetConvar('ac_framework', 'auto')

--- Panel HTTP API (uden trailing slash). Overskrives af convar `ac_api_url`.
Config.ApiUrl = GetConvar('ac_api_url', 'http://127.0.0.1:3000')

--- Server API-nøgle (klartekst). Brug convar `ac_api_key` fra server.cfg (commit ikke).
Config.ApiKey = GetConvar('ac_api_key', 'CHANGE_ME_API_KEY')

--- Server-id fra web-panelet. Convar `ac_server_id`.
Config.ServerId = GetConvar('ac_server_id', '')

--- Hvor ofte remote config opdateres (ms). Convar `ac_config_refresh_ms`.
Config.ConfigRefreshMs = tonumber(GetConvar('ac_config_refresh_ms', '60000')) or 60000

--- Hvor ofte ban-listen opdateres (ms). Convar `ac_ban_refresh_ms`.
Config.BanRefreshMs = tonumber(GetConvar('ac_ban_refresh_ms', '60000')) or 60000

--- Ace-permission der låser /ac-kommandoer op uden et framework-staff-tjek.
Config.StaffAce = GetConvar('ac_staff_ace', 'scaffold_ac.staff')

--- Lokal fallback hvis API ikke kan nås (matcher panelets JSON-shape).
Config.DefaultRemoteConfig = {
    movement = { speedHack = false, noclip = false },
    weapons = { spawnCheck = false, damageModifier = false },
    entities = { entitySpam = false, blacklistedModels = {} },
    webhooks = { url = '', banWebhook = '', alertWebhook = '' },
}
