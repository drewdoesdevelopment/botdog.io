require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

// Initialize Discord Client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Each slash command maps to a Pterodactyl power signal
const POWER_ACTIONS = {
    'start-server': {
        signal: 'start',
        description: 'Starts your Kinetic Hosting game server.',
        success: '🚀 **Power signal sent successfully!** Your Kinetic server is starting up.',
        failure: '❌ Failed to start the server.'
    },
    'stop-server': {
        signal: 'stop',
        description: 'Gracefully stops your Kinetic Hosting game server.',
        success: '🛑 **Power signal sent successfully!** Your Kinetic server is shutting down.',
        failure: '❌ Failed to stop the server.'
    },
    'restart-server': {
        signal: 'restart',
        description: 'Restarts your Kinetic Hosting game server.',
        success: '🔁 **Power signal sent successfully!** Your Kinetic server is restarting.',
        failure: '❌ Failed to restart the server.'
    }
};

// Define the slash commands
const commands = Object.entries(POWER_ACTIONS).map(([name, action]) =>
    new SlashCommandBuilder()
        .setName(name)
        .setDescription(action.description)
        .toJSON()
);

// Register the slash commands with Discord
client.once('clientReady', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}!`);

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('🔄 Started refreshing application (/) commands.');
        // Guild commands appear instantly; global commands can take up to an hour.
        const route = process.env.GUILD_ID
            ? Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID)
            : Routes.applicationCommands(client.user.id);

        const data = await rest.put(route, { body: commands });

        const scope = process.env.GUILD_ID ? `to guild ${process.env.GUILD_ID}` : 'globally';
        console.log(`✅ Registered ${data.length} command(s) ${scope}: ${data.map(c => `/${c.name}`).join(', ')}`);
    } catch (error) {
        console.error(error);
    }
});

// Handle the command interaction
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const action = POWER_ACTIONS[interaction.commandName];
    if (!action) return;

    // Defer reply because API calls can take longer than 3 seconds
    await interaction.deferReply();

    // 1. Build the API request to Kinetic Panel
    const panelUrl = process.env.KINETIC_PANEL_URL.replace(/\/+$/, '');
    const url = `${panelUrl}/api/client/servers/${process.env.KINETIC_SERVER_ID}/power`;

    const config = {
        headers: {
            'Authorization': `Bearer ${process.env.KINETIC_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    const payload = {
        signal: action.signal
    };

    // 2. Send the command to Kinetic
    try {
        const response = await axios.post(url, payload, config);

        // Kinetic's Pterodactyl API returns HTTP 204 (No Content) on success
        if (response.status === 204) {
            await interaction.editReply(action.success);
        } else {
            await interaction.editReply(`⚠️ API responded with an unexpected status code: ${response.status}`);
        }
    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);

        let errorMessage = action.failure;
        if (error.response && error.response.status === 403) {
            errorMessage = '❌ API Error: Invalid API key or permission denied.';
        } else if (error.response && error.response.status === 404) {
            errorMessage = '❌ API Error: Server ID not found. Check your configurations.';
        }

        await interaction.editReply(errorMessage);
    }
});

// Log the bot in
client.login(process.env.DISCORD_TOKEN);
