fx_version 'cerulean'

game 'gta5'



name 'Scaffold AC'

author 'private'

description 'Scaffold AC — anticheat-bridge: server-side core, frivillige client-signaler, panel-styret config + bans.'

version '0.2.0'



-- Kopiér mappen til serverens resources som `scaffold_ac`, og sæt i server.cfg:

--   setr ac_api_url "https://dit-panel.example.com"

--   setr ac_api_key "din-server-api-noegle-i-klartekst"

--   setr ac_server_id "id-fra-panelet"

--   setr ac_framework "auto"   -- auto | standalone | esx | qb | vrp

--   ensure scaffold_ac

-- Se INSTALL.txt og SERVER_CFG_SNIPPET.txt for fuld vejledning.



shared_script 'config.default.lua'



server_scripts {

    'server/main.lua',

}



client_scripts {

    'client/main.lua',

}



files {

    'server/bridge/standalone.lua',

    'server/bridge/esx.lua',

    'server/bridge/qb.lua',

    'server/bridge/vrp.lua',

}



lua54 'yes'

