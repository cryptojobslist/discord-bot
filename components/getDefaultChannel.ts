import { Guild, GuildChannel, Permissions } from 'discord.js'

export default function (guild: Guild): GuildChannel {
  const ChannelsWithPermissions = guild.channels.cache
    .filter(c =>
      c.permissionsFor(guild.me as any).has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL])
    )
    .sort((a: any, b: any) => a.rawPosition - b.rawPosition || a.id - b.id)

  const generalOrWelcome = ChannelsWithPermissions.find(c => {
    return /general|welcome|jobs|job|career|work/gi.test(c.name)
  }) as GuildChannel

  return generalOrWelcome || ChannelsWithPermissions.first()
}
