const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-server')
    .setDescription('Starts the server'),

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    // TODO: implement
    await interaction.reply('Not implemented yet.');
  },
};
