# DrewBot

Bot that allows you to control your KineticHosting server through Discord.
Actively maintained by @drewdoesdevelopment

1. `npm install`
2. Copy your credentials into `.env` (already created from `.env.example`):
   - `DISCORD_TOKEN` — bot token
   - `CLIENT_ID` — application ID
   - `GUILD_ID` — optional; a server ID for instant command registration during development
3. Register slash commands: `npm run deploy`
4. Start the bot: `npm start`

Re-run `npm run deploy` whenever a command's name, description, or options change.

## Commands

| Command | File | Status |
| --- | --- | --- |
| `/start-server` | `src/commands/start-server.js` | stub — implement in `execute()` |

## Adding a command

Drop a file in `src/commands/` exporting `data` (a `SlashCommandBuilder`) and `execute(interaction)`.
It is picked up automatically by both the bot and the deploy script.
