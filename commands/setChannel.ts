import { CommandInteraction, Permissions } from 'discord.js'
import GuildModel from '../models/Guild'

export default {
  name: 'set-channel',
  description: 'Set the channel for the bot to post in.',
  options: [
    {
      name: 'channel',
      description: 'Channel name where we should post jobs',
      required: true,
      type: 7, // Channel
    },
  ],
  fn: async (interaction: CommandInteraction) => {
    console.log('Trying to set channel...')
    console.log(interaction)
    // TODO ensure only admins can set channels
    if (interaction.memberPermissions!.has([Permissions.FLAGS.ADMINISTRATOR])) {
      const guildId = interaction.guild!.id
      const selectedChannel = interaction.options.getChannel('channel')
      const channelId = selectedChannel!.id
      await GuildModel.updateOne({ id: guildId, channelId }, { upsert: true })
      return await interaction.reply(`✅ I'll now be sharing latest jobs in <#${channelId}> only.`)
    }

    return await interaction.reply('Setting a channel…')
  },
}
