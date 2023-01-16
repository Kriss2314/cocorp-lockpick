ESX = exports["es_extended"]:getSharedObject()

ESX.RegisterUsableItem('wytrych', function(source)
  local xPlayer = ESX.GetPlayerFromId(source)
    xPlayer.triggerEvent('cocorp:garazWytrych')
end)

