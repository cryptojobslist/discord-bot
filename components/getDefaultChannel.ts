import { Guild, GuildChannel } from 'discord.js'

export default function (guild: Guild): GuildChannel {
  const generalOrWelcome = guild.channels.cache
    .filter(c => c.type === 'GUILD_TEXT' && c.permissionsFor(guild.client.user as any).has('SEND_MESSAGES'))
    .find(c => {
      return /general|welcome/gi.test(c.name)
    }) as GuildChannel

  const FirstChannelWithPermissions = guild.channels.cache
    .filter(c => c.type === 'GUILD_TEXT' && c.permissionsFor(guild.client.user as any).has('SEND_MESSAGES'))
    .sort((a: any, b: any) => a.position - b.position || a.id - b.id)
    .first() as GuildChannel

  return generalOrWelcome || FirstChannelWithPermissions
}
