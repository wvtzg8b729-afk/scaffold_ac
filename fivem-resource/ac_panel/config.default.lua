--[[
  Default runtime options. Convars override where noted.
  API base URL and credentials must be set via server.cfg convars.
]]

Config = Config or {}

---@type "standalone"|"esx"|"qb"|"vrp"
Config.Framework = GetConvar('ac_framework', 'standalone')

--- Panel HTTP API (no trailing slash). Overridden by convar `ac_api_url`.
Config.ApiUrl = GetConvar('ac_api_url', 'http://127.0.0.1:3000')

--- Server API key (plaintext). Prefer convar `ac_api_key` from server.cfg (not committed).
Config.ApiKey = GetConvar('ac_api_key', 'CHANGE_ME_API_KEY')

--- Server row id from the web panel. Convar `ac_server_id`.
Config.ServerId = GetConvar('ac_server_id', '')

--- How often to refresh remote config (ms). Convar `ac_config_refresh_ms` (integer).
Config.ConfigRefreshMs = tonumber(GetConvar('ac_config_refresh_ms', '60000')) or 60000

--- Local fallback when API is unreachable (matches panel JSON shape).
Config.DefaultRemoteConfig = {
    movement = { speedHack = false, noclip = false },
    weapons = { spawnCheck = false, damageModifier = false },
    entities = { entitySpam = false, blacklistedModels = {} },
    webhooks = { url = '', banWebhook = '', alertWebhook = '' },
}
