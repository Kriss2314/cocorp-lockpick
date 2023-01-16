
local slot = 0
local prot = false
local isPicking = false
ESX = exports["es_extended"]:getSharedObject()
Citizen.CreateThread(function()
    PlayerData = ESX.GetPlayerData()   
end)

local odpalone = false

local vehicles = {
	"akuma",
	"avarus",
	"bagger",
	"bati",
	"bati2",
	"bf400",
	"carbonrs",
	"chimera",
	"cliffhanger",
	"daemon",
	"daemon2",
	"defiler",
	"deathbike",
	"deathbike2",
	"deathbike3",
	"diablous",
	"diablous2",
	"double",
	"enduro",
	"esskey",
	"faggio",
	"faggio2",
	"faggio3",
	"fcr",
	"fcr2",
	"gargoyle",
	"hakuchou2",
	"hexer",
	"innovation",
	"lectro",
	"manchez",
	"nemesis",
	"nightblade",
	"oppressor",
	"oppressor2",
	"pcj",
	"ratbike",
	"ruffian",
	"rrocket",
	"sanchez",
	"sanchez2",
	"sanctus",
	"shotaro",
	"sovereign",
	"stryder",
	"thrust",
	"vader",
	"vindicator",
	"vortex",
	"wolfsbane",
	"zombiea",
	"zombieb",
	"manchez2"
}

local classes = {
	[15] = true,
	[16] = true,
	[19] = true
}

local models = {}

Citizen.CreateThread(function()
	for k,v in pairs(vehicles) do
	
		models[GetHashKey(v)] = true
		
		if v == 'sanchez' then
			print('sanchez '..GetHashKey(v))
		end
		
	end

end)

RegisterNetEvent('cocorp:garazWytrych')
AddEventHandler('cocorp:garazWytrych', function(Slot)
    local playerPed = PlayerPedId()
    local coords    = GetEntityCoords(playerPed)
    local vehicle, closestdistance = ESX.Game.GetClosestVehicle(coords)

    if closestdistance < 6.0 and ((not models[GetEntityModel(vehicle)] and not classes[GetVehicleClass(vehicle)]) or IsVehiclePreviouslyOwnedByPlayer(vehicle)) then
		if not isPicking then
			isPicking = true
			--TriggerEvent('animki:lockpick', true)
			slot = Slot
			odpalone = true
			prot = false
			SendNUIMessage({
				odpal = true
			})
			SetNuiFocus(true, false)
		end
	else
		ESX.ShowNotification("W pobliżu musi być pojazd lub nie jesteś w stanie tego otworzyć")
	end
end)


RegisterNUICallback('wygrana', function(data, cb)
    cb('ok')
    SendNUIMessage({
        odpal = false
    })
    SetNuiFocus(false)
    odpalone = false
    prot = true
    local playerPed = PlayerPedId()
    local coords    = GetEntityCoords(playerPed)
    local vehicle, closestdistance = ESX.Game.GetClosestVehicle(coords)
	TriggerEvent('kaiser_house_rob:openDoors')
    if closestdistance < 6.0 then
        TriggerServerEvent('carkeys:RequestVehicleLocknpcReverse', VehToNet(vehicle), GetVehicleDoorLockStatus(vehicle))
    else
        TriggerEvent('esx_doorlock:opendoors')
    end
    TriggerEvent('animki:lockpick', false)
    isPicking = false

end)

RegisterNUICallback('przegrana', function(data, cb)
    cb('ok')
    SendNUIMessage({
        odpal = false
    })
    SetNuiFocus(false)
    odpalone = false
    if prot == false then
        TriggerServerEvent('kaiser:lockpickfail', slot)
    end
    isPicking = false
end)

Citizen.CreateThread(function ()
    while true do
        Citizen.Wait(0)
        if odpalone then
            DisableAllControlActions(0)
        end
    end
end)

RegisterCommand('test', function ()
	TriggerEvent('cocorp:garazWytrych')
end)