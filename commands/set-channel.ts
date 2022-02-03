import { Interaction, Permissions } from 'discord.js'
import Guild from 'models/Guild'

module.exports = {
  name: 'set-channel',
  description: 'Set the channel for the bot to post in.',
  fn: async (interaction: Interaction) => {
    // TODO ensure only admins can set channels
    if (interaction.memberPermissions!.has([Permissions.FLAGS.ADMINISTRATOR])) {
      // TODO pick up channel id from message
      const channelId = interaction.memberPermissions
      const guild = await Guild.updateOne(
        {
          id: interaction.guildId,
          channelId,
        },
        {
          upsert: true,
        }
      )
    }
  },
}
