import { Job } from 'types'
import { Client, DiscordAPIError, Guild, GuildBasedChannel } from 'discord.js'
import * as Sentry from '@sentry/node';
import GuildModel from '../models/Guild'
import FormatJobMessage from './formatting/job'
import GetDefaultChannel, { canSendJobMessages, getJobChannels } from './getDefaultChannel'
import { fetchOneById } from './jobsApi'
import DMAdmin from './dmAdminThatBotIsNotWellConfigured'

async function sendToAvailableChannel(guild: Guild, message: string, configuredChannelId?: string) {
  const attempted = new Set<string>()
  const tryChannel = async (channel: GuildBasedChannel | null | undefined) => {
    if (!canSendJobMessages(channel) || channel.guild.id !== guild.id || attempted.has(channel.id)) return undefined
    attempted.add(channel.id)
    try {
      await channel.send(message)
      return channel
    } catch (err) {
      if (!(err instanceof DiscordAPIError) || ![10003, 50001, 50013].includes(err.code)) throw err
      console.warn(`Cannot post in ${guild.name} (${guild.id}) Channel: ${channel.id}: Discord ${err.code}; trying another channel.`)
      return undefined
    }
  }

  const preferred = configuredChannelId
    ? guild.channels.cache.get(configuredChannelId)
    : GetDefaultChannel(guild)
  const delivered = await tryChannel(preferred)
  if (delivered) return delivered

  // Refresh the bot's roles and channel overwrites before deciding there is nowhere to post.
  const [, , channels] = await Promise.all([
    guild.members.fetchMe({ force: true }),
    guild.roles.fetch(),
    guild.channels.fetch(),
  ])
  const candidates = [
    configuredChannelId ? channels.get(configuredChannelId) : undefined,
    ...getJobChannels(channels.values()),
  ]
  for (const channel of candidates) {
    const fallback = await tryChannel(channel)
    if (fallback) return fallback
  }
  return undefined
}

/**
 * Send a formatted message to each Guild to the selected channel and respect the filter
 *
 * @export
 * @param {Job} job
 * @param {*} client
 */
export default async function PromoteNewJob(_job: Job, client: Client) {
  const job = await fetchOneById(_job.id)
  if (process.env.NODE_ENV === 'production') {
    if (!job.jobTitle) throw new Error('Job title is required')
    if (!job.companyName) throw new Error('Company name is required')
    if (!(job.bitlyLink || job.canonicalURL)) throw new Error('Job URL is required')
  }

  let activeGuilds = 0
  let totalAudience = 0
  const message = FormatJobMessage(job)
  console.log(`Promoting job ${job.id}. Message preview:\n${message}`)
  await client.guilds.fetch()
  for (const guild of client.guilds.cache.values()) {
    let configuredChID: string | undefined
    try {
      if (!guild.available) continue
      const guildConfig = await GuildModel.findOne({ id: guild.id })
      configuredChID = guildConfig?.channelId as string | undefined
      const textChannel = await sendToAvailableChannel(guild, message, configuredChID)
      if (!textChannel) {
        console.warn(
          `Skipping job for ${guild.name} (${guild.id}): no writable text channel after refreshing permissions and trying available channels.`
        )
        await DMAdmin(client, guild)
        continue
      }

      totalAudience += textChannel.guild.memberCount
      activeGuilds += 1
      console.log(
        `Sent job to: "${guild.name}"\tMembers: ${guild.memberCount}\tChannel: ${textChannel.name}\tGuildId: ${textChannel.guild.id}\t${job.bitlyLink || job.canonicalURL}`
      )
      await GuildModel.updateOne(
        { id: guild.id },
        { members: textChannel.guild.memberCount, guildName: guild.name },
        { upsert: true }
      )
    } catch (err) {
      console.error(`Error promoting job to ${guild.name} (${guild.id})`, err)
      Sentry.captureException(err, { extra: { guildId: guild.id, configuredChannelId: configuredChID, jobId: job.id } });
    }
  }

  console.log(
    `Promoted in ${activeGuilds} guild(s). ~${totalAudience} audience. ${job.id}\t ${job.jobTitle} - ${job.companyName} - ${job.canonicalURL}`
  )
}
