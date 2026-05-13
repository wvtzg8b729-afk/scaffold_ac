--[[
  Standalone bridge — safe defaults when no framework is present.
]]

Bridge = Bridge or {}

---@param source number
---@return string|nil identifier primary license-style id if available
function Bridge.GetPrimaryIdentifier(source)
    local ids = GetPlayerIdentifiers(source)
    for _, id in ipairs(ids) do
        if id:find('license:') == 1 then
            return id
        end
    end
    return ids[1]
end

---@param source number
---@return string jobName
---@return number jobGrade
function Bridge.GetJob(source)
    return 'citizen', 0
end

---@param source number
---@return string|nil group admin/staff group label
function Bridge.GetGroup(source)
    return nil
end

---@param source number
---@return boolean isStaff
function Bridge.IsStaff(source)
    return IsPlayerAceAllowed(source, 'ac_panel.staff') or false
end
