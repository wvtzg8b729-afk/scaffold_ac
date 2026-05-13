fx_version 'cerulean'
game 'gta5'

name 'ac_panel'
author 'private'
description 'MVP anticheat panel bridge — config sync + detection stubs (no auto-bans).'
version '0.1.0'

-- Copy this folder to your server's resources as `ac_panel`, then:
--   setr ac_api_url "https://your-panel.example.com"
--   setr ac_api_key "your-server-api-key-plaintext"
--   setr ac_server_id "cuid-from-panel"
--   ensure ac_panel

shared_script 'config.default.lua'

server_scripts {
    'server/main.lua',
}

client_scripts {
    'client/main.lua',
}

lua54 'yes'
