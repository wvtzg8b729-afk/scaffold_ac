--[[
  vRP bridge — many forks exist; this uses common `vrp` proxy pattern when present.
  If `vrp` is not started, identifiers fall back to FiveM natives.
]]

Bridge = Bridge or {}

local Proxy = nil
local vRP = nil

local function tryInit()
    if vRP then return true end
    if GetResourceState('vrp') ~= 'started' then
        return false
    end
    local ok = pcall(function()
        Proxy = module('vrp', 'lib/Proxy')
        vRP = Proxy.getInterface('vRP')
    end)
    return ok and vRP ~= nil
end

local function licenseFallback(source)
    local ids = GetPlayerIdentifiers(source)
    for _, id in ipairs(ids) do
        if id:find('license:') == 1 then
            return id
        end
    end
    return ids[1]
end

---@param source number
---@return string|nil
function Bridge.GetPrimaryIdentifier(source)
    if tryInit() and vRP and vRP.getUserId then
        local uid = vRP.getUserId({ source })
        if uid then
            return ('vrp:%s'):format(uid)
        end
    end
    return licenseFallback(source)
end

---@param source number
---@return string
---@return number
function Bridge.GetJob(source)
    -- vRP jobs vary by module; return safe defaults when unknown
    if not tryInit() or not vRP then return 'citizen', 0 end
    return 'citizen', 0
end

---@param source number
---@return string|nil
function Bridge.GetGroup(source)
    if not tryInit() or not vRP or not vRP.getUserGroup then return nil end
    local uid = vRP.getUserId and vRP.getUserId({ source })
    if not uid then return nil end
    return vRP.getUserGroup({ uid })
end

---@param source number
---@return boolean
function Bridge.IsStaff(source)
    local g = Bridge.GetGroup(source)
    if type(g) == 'string' and g ~= '' and g ~= 'user' then return true end
    return IsPlayerAceAllowed(source, 'scaffold_ac.staff') or false
end
