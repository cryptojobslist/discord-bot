import { Job } from 'types'
import { Client } from 'discord.js'
import Guild from '../models/Guild'
import FormatJobMessage from '../components/formatting/job'
import GetDefaultChannel from '../components/get-default-channel'

export default async function PromoteNewJob(job: Job, client: Client) {
  // send formatted message to each guild to the selected channel and respect the filter
  const guilds = await client.guilds.fetch()
  for (const guild of guilds.values()) {
    const guildConfig = await Guild.findOne({ id: guild.id })
    const message = FormatJobMessage(job)
    const defaultChannel = GetDefaultChannel(guild)
    console.log(guild, guildConfig, { message, defaultChannel })
  }
}
