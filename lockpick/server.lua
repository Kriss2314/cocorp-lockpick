ESX = exports["es_extended"]:getSharedObject()

ESX.RegisterUsableItem('wytrych', function(playerId)
  local xPlayer = ESX.GetPlayerFromId(playerId)
    xPlayer.triggerEvent('cocorp:garazWytrych')
end)

