import { Guild, GuildBasedChannel, NewsChannel, Permissions, TextChannel } from 'discord.js'

export function canSendJobMessages(channel: GuildBasedChannel | null | undefined): channel is TextChannel | NewsChannel {
  if (!channel || (channel.type !== 'GUILD_TEXT' && channel.type !== 'GUILD_NEWS')) return false
  const member = channel.guild.members.me
  return !!member && !!channel.permissionsFor(member)?.has([
    Permissions.FLAGS.VIEW_CHANNEL,
    Permissions.FLAGS.SEND_MESSAGES,
  ])
}

export function getJobChannels(channels: Iterable<GuildBasedChannel | null>): (TextChannel | NewsChannel)[] {
  const priority = (channel: TextChannel | NewsChannel) => {
    if (/job|career|work|opportunit/i.test(channel.name)) return 0
    if (/general|welcome/i.test(channel.name)) return 1
    return 2
  }

  return [...channels]
    .filter(canSendJobMessages)
    .sort((a, b) => priority(a) - priority(b) || a.rawPosition - b.rawPosition || a.id.localeCompare(b.id))
}

export default function (guild: Guild): TextChannel | NewsChannel | undefined {
  return getJobChannels(guild.channels.cache.values())[0]
}
