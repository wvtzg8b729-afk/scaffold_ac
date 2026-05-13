--[[
  ESX bridge — uses `es_extended` export / xPlayer when resource is started.
  If `es_extended` is missing, behavior degrades to identifier-based defaults.
]]

Bridge = Bridge or {}

local ESX = nil

local function tryInit()
    if ESX then return true end
    if GetResourceState('es_extended') ~= 'started' then
        return false
    end
    local ok, obj = pcall(function()
        return exports['es_extended']:getSharedObject()
    end)
    if ok and obj then
        ESX = obj
        return true
    end
    return false
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
    if tryInit() then
        local xPlayer = ESX.GetPlayerFromId(source)
        if xPlayer and xPlayer.identifier then
            return xPlayer.identifier
        end
    end
    return licenseFallback(source)
end

---@param source number
---@return string
---@return number
function Bridge.GetJob(source)
    if not tryInit() then return 'citizen', 0 end
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer or not xPlayer.job then return 'citizen', 0 end
    return xPlayer.job.name or 'citizen', xPlayer.job.grade or 0
end

---@param source number
---@return string|nil
function Bridge.GetGroup(source)
    if not tryInit() then return nil end
    local xPlayer = ESX.GetPlayerFromId(source)
    if not xPlayer or not xPlayer.getGroup then return nil end
    return xPlayer.getGroup()
end

---@param source number
---@return boolean
function Bridge.IsStaff(source)
    local g = Bridge.GetGroup(source)
    if g == 'admin' or g == 'superadmin' then return true end
    return IsPlayerAceAllowed(source, Config.StaffAce or 'scaffold_ac.staff') or false
end
