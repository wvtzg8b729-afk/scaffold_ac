local resName = GetCurrentResourceName()

local function deepCopy(t)
    if type(t) ~= 'table' then return t end
    local o = {}
    for k, v in pairs(t) do
        o[k] = deepCopy(v)
    end
    return o
end

local function mergeDefaults(remote)
    local base = deepCopy(Config.DefaultRemoteConfig)
    if type(remote) ~= 'table' then return base end
    for cat, val in pairs(remote) do
        if type(val) == 'table' and type(base[cat]) == 'table' then
            for k, v in pairs(val) do
                base[cat][k] = v
            end
        else
            base[cat] = val
        end
    end
    return base
end

--- In-memory module toggles + metadata for MVP detections.
AcModule = {
    config = deepCopy(Config.DefaultRemoteConfig),
    lastFetchOk = false,
    lastError = nil,
    lastUpdatedAt = nil,
}

local function loadBridge()
    local fw = (Config.Framework or 'standalone'):lower()
    local map = {
        standalone = 'server/bridge/standalone.lua',
        esx = 'server/bridge/esx.lua',
        qb = 'server/bridge/qb.lua',
        vrp = 'server/bridge/vrp.lua',
    }
    local rel = map[fw] or map.standalone
    local src = LoadResourceFile(resName, rel)
    if not src then
        print(('[ac_panel] Missing bridge file %s, using standalone.'):format(rel))
        src = LoadResourceFile(resName, map.standalone)
    end
    local fn, err = load(src, ('@%s/%s'):format(resName, rel), 't')
    if not fn then
        error(('[ac_panel] Bridge compile error: %s'):format(err))
    end
    fn()
end

loadBridge()

local function authHeaders()
    return {
        ['Authorization'] = 'Bearer ' .. tostring(Config.ApiKey),
        ['Content-Type'] = 'application/json',
        ['User-Agent'] = 'ac_panel-fivem/0.1',
    }
end

local function fetchRemoteConfig(cb)
    local sid = Config.ServerId
    if sid == nil or sid == '' then
        AcModule.lastFetchOk = false
        AcModule.lastError = 'ac_server_id convar empty'
        print('[ac_panel] Set convar ac_server_id to your panel server id.')
        if cb then cb(false) end
        return
    end
    local url = ('%s/api/servers/%s/config'):format(Config.ApiUrl:gsub('/+$', ''), sid)
    PerformHttpRequest(url, function(status, body)
        if status ~= 200 or not body or body == '' then
            AcModule.lastFetchOk = false
            AcModule.lastError = ('HTTP %s'):format(status)
            print(('[ac_panel] Config fetch failed: %s'):format(AcModule.lastError))
            if cb then cb(false) end
            return
        end
        local ok, decoded = pcall(json.decode, body)
        if not ok or type(decoded) ~= 'table' then
            AcModule.lastFetchOk = false
            AcModule.lastError = 'invalid JSON'
            print('[ac_panel] Config JSON decode failed.')
            if cb then cb(false) end
            return
        end
        AcModule.config = mergeDefaults(decoded)
        AcModule.lastFetchOk = true
        AcModule.lastError = nil
        AcModule.lastUpdatedAt = os.time()
        print('[ac_panel] Remote config applied.')
        if cb then cb(true) end
    end, 'GET', '', authHeaders())
end

local function runStubDetections()
    local cfg = AcModule.config
    -- MVP: log-only stubs when toggles are enabled (no kicks/bans).
    if cfg.movement and cfg.movement.speedHack then
        print('[ac_panel][detection][movement.speedHack] stub active (log only)')
    end
    if cfg.movement and cfg.movement.noclip then
        print('[ac_panel][detection][movement.noclip] stub active (log only)')
    end
    if cfg.weapons and cfg.weapons.spawnCheck then
        print('[ac_panel][detection][weapons.spawnCheck] stub active (log only)')
    end
    if cfg.weapons and cfg.weapons.damageModifier then
        print('[ac_panel][detection][weapons.damageModifier] stub active (log only)')
    end
    if cfg.entities and cfg.entities.entitySpam then
        print('[ac_panel][detection][entities.entitySpam] stub active (log only)')
    end
end

CreateThread(function()
    Wait(500)
    fetchRemoteConfig(nil)
    while true do
        Wait(Config.ConfigRefreshMs)
        fetchRemoteConfig(nil)
    end
end)

-- Periodic stub "scan" so toggles visibly do something in logs without player events.
CreateThread(function()
    while true do
        Wait(120000)
        if AcModule.lastFetchOk then
            runStubDetections()
        end
    end
end)

RegisterNetEvent('ac_panel:clientHeartbeat', function()
    local src = source
    if not src or src <= 0 then return end
    local id = Bridge.GetPrimaryIdentifier(src)
    print(('[ac_panel] heartbeat src=%s id=%s job=%s:%s'):format(
        src,
        id or 'nil',
        select(1, Bridge.GetJob(src)),
        select(2, Bridge.GetJob(src))
    ))
end)

AddEventHandler('playerConnecting', function(_, _setKick, _)
    -- Optional: could sync bans from API here in a future iteration.
end)

print('[ac_panel] Server booted. Framework=' .. tostring(Config.Framework))
