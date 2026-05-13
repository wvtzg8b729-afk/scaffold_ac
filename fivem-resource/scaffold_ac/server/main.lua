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
    framework = 'standalone',
    lastFetchOk = false,
    lastError = nil,
    lastUpdatedAt = nil,
}

--- In-memory ban-cache hentet fra panel API.
AcBans = {
    byIdentifier = {},
    count = 0,
    lastSync = 0,
    ok = false,
}

local function detectFramework()
    local explicit = (Config.Framework or 'auto'):lower()
    if explicit ~= 'auto' and explicit ~= '' then
        return explicit
    end
    if GetResourceState('es_extended') == 'started' then return 'esx' end
    if GetResourceState('qb-core') == 'started' then return 'qb' end
    if GetResourceState('vrp') == 'started' then return 'vrp' end
    return 'standalone'
end

local function loadBridge()
    local fw = detectFramework()
    AcModule.framework = fw
    local map = {
        standalone = 'server/bridge/standalone.lua',
        esx = 'server/bridge/esx.lua',
        qb = 'server/bridge/qb.lua',
        vrp = 'server/bridge/vrp.lua',
    }
    local rel = map[fw] or map.standalone
    local src = LoadResourceFile(resName, rel)
    if not src then
        print(('[scaffold_ac] Mangler bridge-fil %s, falder tilbage til standalone.'):format(rel))
        rel = map.standalone
        src = LoadResourceFile(resName, rel)
    end
    local fn, err = load(src, ('@%s/%s'):format(resName, rel), 't')
    if not fn then
        error(('[scaffold_ac] Bridge compile error: %s'):format(err))
    end
    fn()
end

loadBridge()

local function authHeaders()
    return {
        ['Authorization'] = 'Bearer ' .. tostring(Config.ApiKey),
        ['Content-Type'] = 'application/json',
        ['User-Agent'] = 'scaffold_ac-fivem/0.2',
    }
end

local function apiUrl(path)
    return ('%s%s'):format((Config.ApiUrl or ''):gsub('/+$', ''), path)
end

--- Send Discord-style webhook (simple content payload). No-op hvis URL er tom.
local function postWebhook(url, content)
    if type(url) ~= 'string' or url == '' then return end
    PerformHttpRequest(url, function() end, 'POST', json.encode({
        content = content,
        username = 'Scaffold AC',
    }), { ['Content-Type'] = 'application/json' })
end

--- Vælg alert-webhook med fallback til base-webhook.
local function alertUrl()
    local w = AcModule.config.webhooks or {}
    if w.alertWebhook and w.alertWebhook ~= '' then return w.alertWebhook end
    return w.url or ''
end

local function banUrl()
    local w = AcModule.config.webhooks or {}
    if w.banWebhook and w.banWebhook ~= '' then return w.banWebhook end
    return w.url or ''
end

local function fetchRemoteConfig(cb)
    local sid = Config.ServerId
    if sid == nil or sid == '' then
        AcModule.lastFetchOk = false
        AcModule.lastError = 'ac_server_id convar er tom'
        print('[scaffold_ac] Sæt convar ac_server_id til server-id fra panelet.')
        if cb then cb(false) end
        return
    end
    PerformHttpRequest(apiUrl(('/api/servers/%s/config'):format(sid)), function(status, body)
        if status ~= 200 or not body or body == '' then
            AcModule.lastFetchOk = false
            AcModule.lastError = ('HTTP %s'):format(status)
            print(('[scaffold_ac] Config fetch fejlede: %s'):format(AcModule.lastError))
            if cb then cb(false) end
            return
        end
        local ok, decoded = pcall(json.decode, body)
        if not ok or type(decoded) ~= 'table' then
            AcModule.lastFetchOk = false
            AcModule.lastError = 'invalid JSON'
            print('[scaffold_ac] Config JSON decode fejlede.')
            if cb then cb(false) end
            return
        end
        AcModule.config = mergeDefaults(decoded)
        AcModule.lastFetchOk = true
        AcModule.lastError = nil
        AcModule.lastUpdatedAt = os.time()
        print('[scaffold_ac] Remote config opdateret.')
        if cb then cb(true) end
    end, 'GET', '', authHeaders())
end

local function fetchBans(cb)
    local sid = Config.ServerId
    if sid == nil or sid == '' then
        if cb then cb(false) end
        return
    end
    PerformHttpRequest(apiUrl(('/api/servers/%s/bans'):format(sid)), function(status, body)
        if status ~= 200 or not body or body == '' then
            AcBans.ok = false
            if cb then cb(false) end
            return
        end
        local ok, decoded = pcall(json.decode, body)
        if not ok or type(decoded) ~= 'table' then
            AcBans.ok = false
            if cb then cb(false) end
            return
        end
        local idx = {}
        local count = 0
        for _, ban in ipairs(decoded) do
            local ids = ban.identifiers
            if type(ids) == 'table' then
                for _, id in ipairs(ids) do
                    if type(id) == 'string' and id ~= '' then
                        idx[id:lower()] = ban
                    end
                end
                count = count + 1
            end
        end
        AcBans.byIdentifier = idx
        AcBans.count = count
        AcBans.ok = true
        AcBans.lastSync = os.time()
        print(('[scaffold_ac] Ban-liste opdateret (%d aktive).'):format(count))
        if cb then cb(true) end
    end, 'GET', '', authHeaders())
end

--- Send ban til panel — returnerer via callback om det lykkedes.
local function postBan(identifiers, reason, cb)
    local sid = Config.ServerId
    if sid == nil or sid == '' then
        if cb then cb(false, 'ac_server_id mangler') end
        return
    end
    if type(identifiers) ~= 'table' or #identifiers == 0 then
        if cb then cb(false, 'ingen identifiers') end
        return
    end
    local payload = json.encode({
        identifiers = identifiers,
        reason = reason or 'Ingen årsag',
    })
    PerformHttpRequest(apiUrl(('/api/servers/%s/bans'):format(sid)), function(status, body)
        if status >= 200 and status < 300 then
            if cb then cb(true) end
            fetchBans(nil)
            return
        end
        if cb then cb(false, ('HTTP %s: %s'):format(status, body or '')) end
    end, 'POST', payload, authHeaders())
end

local function runStubDetections()
    local cfg = AcModule.config
    local fired = {}
    if cfg.movement and cfg.movement.speedHack then
        fired[#fired + 1] = 'movement.speedHack'
    end
    if cfg.movement and cfg.movement.noclip then
        fired[#fired + 1] = 'movement.noclip'
    end
    if cfg.weapons and cfg.weapons.spawnCheck then
        fired[#fired + 1] = 'weapons.spawnCheck'
    end
    if cfg.weapons and cfg.weapons.damageModifier then
        fired[#fired + 1] = 'weapons.damageModifier'
    end
    if cfg.entities and cfg.entities.entitySpam then
        fired[#fired + 1] = 'entities.entitySpam'
    end
    for _, name in ipairs(fired) do
        print(('[scaffold_ac][detection][%s] stub aktiv (log only)'):format(name))
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

CreateThread(function()
    Wait(1500)
    fetchBans(nil)
    while true do
        Wait(Config.BanRefreshMs)
        fetchBans(nil)
    end
end)

-- Periodisk stub-"scan" så toggles synligt gør noget i log uden player-events.
CreateThread(function()
    while true do
        Wait(120000)
        if AcModule.lastFetchOk then
            runStubDetections()
        end
    end
end)

RegisterNetEvent('scaffold_ac:clientHeartbeat', function()
    local src = source
    if not src or src <= 0 then return end
    local id = Bridge.GetPrimaryIdentifier(src)
    print(('[scaffold_ac] heartbeat src=%s id=%s job=%s:%s'):format(
        src,
        id or 'nil',
        select(1, Bridge.GetJob(src)),
        select(2, Bridge.GetJob(src))
    ))
end)

--- Bloker bannede spillere ved connect (matcher på et hvilket som helst identifier).
AddEventHandler('playerConnecting', function(_name, _setKick, deferrals)
    local src = source
    deferrals.defer()
    Wait(0)
    deferrals.update('Scaffold AC: kontrollerer adgang…')
    local ids = GetPlayerIdentifiers(src) or {}
    for _, id in ipairs(ids) do
        local b = AcBans.byIdentifier[(id or ''):lower()]
        if b then
            local reason = (b.reason and b.reason ~= '') and b.reason or 'Ingen årsag opgivet'
            deferrals.done(('Du er bannet fra denne server.\nÅrsag: %s'):format(reason))
            postWebhook(banUrl(), ('Blokerede ban-match for %s — årsag: %s'):format(id, reason))
            return
        end
    end
    deferrals.done()
end)

local function isStaff(src)
    if src == 0 then return true end
    if Bridge and Bridge.IsStaff and Bridge.IsStaff(src) then return true end
    return IsPlayerAceAllowed(src, Config.StaffAce or 'scaffold_ac.staff') or false
end

--- /acstatus — viser status i konsol / chat for staff.
RegisterCommand('acstatus', function(src)
    if not isStaff(src) then return end
    local lines = {
        ('framework=%s'):format(AcModule.framework),
        ('configOk=%s err=%s'):format(tostring(AcModule.lastFetchOk), tostring(AcModule.lastError)),
        ('bansOk=%s count=%d'):format(tostring(AcBans.ok), AcBans.count),
    }
    for _, l in ipairs(lines) do
        if src == 0 then
            print('[scaffold_ac] ' .. l)
        else
            TriggerClientEvent('chat:addMessage', src, { args = { '[scaffold_ac]', l } })
        end
    end
end, false)

--- /acban <player_id> <reason ...> — sender ban til panel.
RegisterCommand('acban', function(src, args)
    if not isStaff(src) then return end
    local target = tonumber(args[1])
    if not target or target <= 0 then
        print('[scaffold_ac] Brug: /acban <player_id> <årsag>')
        return
    end
    local reason = table.concat(args, ' ', 2)
    if reason == '' then reason = 'Manuel ban via /acban' end
    local ids = GetPlayerIdentifiers(target) or {}
    if #ids == 0 then
        print('[scaffold_ac] Ingen identifiers fundet for target.')
        return
    end
    postBan(ids, reason, function(ok, err)
        if ok then
            print(('[scaffold_ac] Ban registreret for player %s.'):format(target))
            postWebhook(banUrl(), ('Manuel ban: src=%s reason=%s'):format(target, reason))
            DropPlayer(target, ('Bannet: %s'):format(reason))
        else
            print(('[scaffold_ac] Ban POST fejlede: %s'):format(err or 'ukendt'))
        end
    end)
end, false)

--- /acrefresh — tving config + bans-refresh.
RegisterCommand('acrefresh', function(src)
    if not isStaff(src) then return end
    fetchRemoteConfig(nil)
    fetchBans(nil)
end, false)

exports('GetConfig', function() return AcModule.config end)
exports('GetFramework', function() return AcModule.framework end)
exports('PostBan', function(identifiers, reason)
    postBan(identifiers, reason, nil)
end)
exports('SendAlert', function(message)
    postWebhook(alertUrl(), tostring(message or ''))
end)

print(('[scaffold_ac] Server booted. Framework=%s (configured=%s)'):format(
    AcModule.framework,
    Config.Framework
))
