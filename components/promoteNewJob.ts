import { Job } from 'types'
import { Client } from 'discord.js'
import Guild from '../models/Guild'
import FormatJobMessage from './formatting/job'
import GetDefaultChannel from './getDefaultChannel'
import { fetchOneById } from './jobsApi'

/**
 * Send a formatted message to each Guild to the selected channel and respect the filter
 *
 * @export
 * @param {Job} job
 * @param {*} client
 */
export default async function PromoteNewJob(_job: Job, client: any) {
  const job = await fetchOneById(_job.id)
  if (process.env.NODE_ENV === 'production') {
    if (!job.jobTitle) throw new Error('Job title is required')
    if (!job.companyName) throw new Error('Company name is required')
    if (!(job.bitlyLink || job.canonicalURL)) throw new Error('Job URL is required')
  }

  const message = FormatJobMessage(job)
  await client.guilds.fetch()
  client.guilds.cache.forEach(async guild => {
    console.log(guild.name)
    const guildConfig = await Guild.findOne({ id: guild.id })

    const fallbackChannel = GetDefaultChannel(guild).id
    const defaultChannel: string = guildConfig.channelId || fallbackChannel

    try {
      client.channels.cache.get(defaultChannel)!.send(message)
    } catch (err) {
      console.error(`Failed to send to defaultChannel`, err)
      client.channels.cache.get(fallbackChannel)!.send(message)
    }
  })
}
