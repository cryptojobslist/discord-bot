import { CommandInteraction, Message, TextChannel, Client, Guild } from 'discord.js'
import GuildModel from '../models/Guild'
import GetDefaultChannel from '../components/getDefaultChannel'

function getMessage(channelId: string) {
  return `
      I'll be sharing latest crypto, web3 and blockchain jobs with your community in <#${channelId}> channel.

      Type \`/set-channel #channel-name\` to set a different channel for job notifications. (Only Admins can do this)

      Check <https://github.com/cryptojobslist/discord-bot> for feedback and feature requests.
      Or contact us at <https://cryptojobslist.com/go/discord>.
      `.replace(/^ +/gm, '')
}

export default {
  name: 'help',
  description: 'List all commands',
  fn: async (interaction: CommandInteraction) => {
    const guild = interaction.guild as Guild
    const guildConfig = await GuildModel.findOne({ id: guild!.id })
    const currentChannelId = guildConfig?.channelId || GetDefaultChannel(guild).id

    await interaction.reply(getMessage(currentChannelId))
  },
}

export async function HelpMessage(message: Message, client: Client) {
  const guild = message.guild as Guild
  const guildConfig = await GuildModel.findOne({ id: guild!.id })
  const currentChannelId = guildConfig?.channelId || GetDefaultChannel(guild).id

  await message.reply(getMessage(currentChannelId))
}
