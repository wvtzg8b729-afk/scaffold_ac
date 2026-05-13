--[[
  QB-Core bridge — uses `qb-core` export `GetCoreObject` when started.
  See QBCore docs; adjust export name if your fork differs.
]]

Bridge = Bridge or {}

local QBCore = nil

local function tryInit()
    if QBCore then return true end
    if GetResourceState('qb-core') ~= 'started' then
        return false
    end
    local ok, obj = pcall(function()
        return exports['qb-core']:GetCoreObject()
    end)
    if ok and obj then
        QBCore = obj
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
    if tryInit() and QBCore and QBCore.Functions then
        local p = QBCore.Functions.GetPlayer(source)
        if p and p.PlayerData and p.PlayerData.license then
            return p.PlayerData.license
        end
    end
    return licenseFallback(source)
end

---@param source number
---@return string
---@return number
function Bridge.GetJob(source)
    if not tryInit() or not QBCore or not QBCore.Functions then return 'unemployed', 0 end
    local p = QBCore.Functions.GetPlayer(source)
    if not p or not p.PlayerData or not p.PlayerData.job then return 'unemployed', 0 end
    local j = p.PlayerData.job
    return j.name or 'unemployed', j.grade and j.grade.level or 0
end

---@param source number
---@return string|nil
function Bridge.GetGroup(source)
    if not tryInit() or not QBCore or not QBCore.Functions then return nil end
    local p = QBCore.Functions.GetPlayer(source)
    if not p or not p.PlayerData then return nil end
    return p.PlayerData.group
end

---@param source number
---@return boolean
function Bridge.IsStaff(source)
    local g = Bridge.GetGroup(source)
    if type(g) == 'string' and (g == 'god' or g == 'admin') then return true end
    return IsPlayerAceAllowed(source, Config.StaffAce or 'scaffold_ac.staff') or false
end
