import { Job } from 'types'
import { Client, TextChannel } from 'discord.js'
import GuildModel from '../models/Guild'
import FormatJobMessage from './formatting/job'
import FormatJobMessageEmbed from './formatting/jobEmbed'
import GetDefaultChannel from './getDefaultChannel'
import { fetchOneById } from './jobsApi'
import DMAdmin from './dmAdminThatBotIsNotWellConfigured'

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
  await client.guilds.fetch()
  for (const guild of client.guilds.cache.values()) {
    const guildConfig = await GuildModel.findOne({ id: guild.id })

    const configuredChID = guildConfig?.channelId as string
    const textChannel = ((await client.channels.cache.get(configuredChID)) as TextChannel) || GetDefaultChannel(guild)

    if (!textChannel) {
      console.error(`No default channel found for ${guild.name}`, guild)
      await DMAdmin(client, guild)
      continue
    }

    try {
      await textChannel.send(message)
      totalAudience += textChannel.guild.memberCount
      activeGuilds += 1
      console.log('Sent job to:', {
        guildName: guild.name,
        memberCount: guild.memberCount,
        jobTitle: job.jobTitle,
        jobLink: job.bitlyLink || job.canonicalURL,
        channelName: textChannel.name,
        channelId: textChannel.id,
        guildId: textChannel.guild.id,
      })
      await GuildModel.updateOne(
        { id: guild.id },
        { members: textChannel.guild.memberCount, guildName: guild.name },
        { upsert: true }
      )
    } catch (err) {
      console.error(`Error sending job to ${guild.name}`, { guild, textChannel }, err)
    }
  }

  console.log(
    `Promoted in ${activeGuilds} guild(s). ~${totalAudience} audience. ${job.id}\t ${job.jobTitle} - ${job.companyName} - ${job.canonicalURL}`
  )
}
