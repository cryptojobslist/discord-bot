import { Guild, GuildChannel, Permissions } from 'discord.js'

export default function (guild: Guild): GuildChannel {
  const ChannelsWithPermissions = guild.channels.cache
    .filter(
      c =>
        ['GUILD_TEXT', 'GUILD_NEWS'].includes(c.type) &&
        c.permissionsFor(guild.client.user as any).has(Permissions.FLAGS.SEND_MESSAGES)
    )
    .sort((a: any, b: any) => a.rawPosition - b.rawPosition || a.id - b.id)

  ChannelsWithPermissions.filter(c => {
    console.log(c.name, c.type, c.permissionsFor(guild.client.user as any).has(Permissions.FLAGS.SEND_MESSAGES))
    return true
  })

  const c = guild.channels.cache.find(c => /crypto-job-listing/gi.test(c.name))
  if (c) {
    console.log(c)
    console.log('c.type', c.type)
    console.log('c.permissionsFor', c.permissionsFor(guild.client.user as any).serialize())
    console.log(
      'c.permissionsFor(guild.client.user as any).has("SEND_MESSAGES")',
      c.permissionsFor(guild.client.user as any).has(Permissions.FLAGS.SEND_MESSAGES)
    )
  }

  const generalOrWelcome = ChannelsWithPermissions.find(c => {
    return /general|welcome|jobs|job|career/gi.test(c.name)
  }) as GuildChannel

  return generalOrWelcome || ChannelsWithPermissions.first()
}
