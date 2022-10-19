import { Guild, Permissions, TextChannel } from 'discord.js'

export default function (guild: Guild): TextChannel {
  const ChannelsWithPermissions = guild.channels.cache
    .filter(
      channel =>
        ['GUILD_TEXT', 'GUILD_NEWS', 'text'].includes(channel.type) &&
        channel.permissionsFor(guild.me as any).has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL])
    )
    .sort((a: any, b: any) => a.rawPosition - b.rawPosition || a.id - b.id)

  const guessJobsChannel = ChannelsWithPermissions.find(c => {
    return /job|career|work|opportunit/gi.test(c.name)
  }) as TextChannel

  const generalOrWelcome = ChannelsWithPermissions.find(c => {
    return /general|welcome/gi.test(c.name)
  }) as TextChannel

  return guessJobsChannel || generalOrWelcome || ChannelsWithPermissions.first()
}
