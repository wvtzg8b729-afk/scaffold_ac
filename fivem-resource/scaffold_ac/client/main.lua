local interval = tonumber(GetConvar('ac_client_heartbeat_ms', '45000')) or 45000

CreateThread(function()
    while true do
        Wait(interval)
        TriggerServerEvent('scaffold_ac:clientHeartbeat')
    end
end)
