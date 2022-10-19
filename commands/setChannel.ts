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
    if (interaction.memberPermissions!.has([Permissions.FLAGS.ADMINISTRATOR])) {
      const guildId = interaction.guild!.id
      const selectedChannel = interaction.options.getChannel('channel')
      const channelId = selectedChannel!.id
      try {
        await (selectedChannel as any).send(`👋 Hello everybody! I'll be sharing latest jobs in this channel!`)

        await GuildModel.updateOne({ id: guildId }, { channelId }, { upsert: true })
        await interaction.reply(`✅ I'll now be sharing latest jobs in <#${channelId}> only.`)
        console.log(
          `/set-channel Guild: ${interaction.guild!.name} (${guildId}), Channel: ${
            selectedChannel!.name
          } (${channelId})`
        )
        return
      } catch (err) {
        return await interaction.reply(
          `❌ Ooops. Please give me permission to **Send Messages** in <#${channelId}> and try again!`
        )
      }
    } else {
      return await interaction.reply(`Only server admins can use this command to set a channel.`)
    }
  },
}
