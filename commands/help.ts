import { Message, TextChannel, Client, Guild } from 'discord.js'
import GuildModel from '../models/Guild'
import GetDefaultChannel from '../components/getDefaultChannel'

export default {
  name: 'help',
  description: 'List all commands',
  fn: async (message: Message, client: Client) => {
    const guild = message.guild as Guild
    const guildConfig = await GuildModel.findOne({ id: guild!.id })
    const currentChannel =
      ((await client.channels.cache.get(guildConfig?.channelId)) as TextChannel) || GetDefaultChannel(guild)

    await message.reply(
      `
      I'll be sharing latest crypto, web3 and blockchain jobs with your community in <#${currentChannel.id}> channel.

      Type \`set channel #channel-name\` to set a different channel for job notifications. (Only Admins can do this)

      Check <https://github.com/cryptojobslist/discord-bot> for feedback and feature requests.
      Or contact us at <https://cryptojobslist.com/go/discord>.
      `.replace(/^ +/gm, '')
    )
  },
}
