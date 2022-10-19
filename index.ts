require('dotenv').config()
import { Client, Intents, TextChannel, Guild } from 'discord.js'
import dbConnect from './components/database'
import GuildModel from './models/Guild'
import { HelpMessage } from './commands/help'
import PromoteNewJob from './components/promoteNewJob'
import GetDefaultChannel from './components/getDefaultChannel'
import WelcomeMessage from './components/formatting/welcome'
import notifyWebhook from './components/notifyWebhook'
import guildsTable from './components/guildsTable'
import badgeN from './components/badgen'
import InitCommands, { RegisterCommandsInAGuild } from './commands/index'
import DMAdmin from './components/dmAdminThatBotIsNotWellConfigured'

import Rollbar from 'rollbar'
if (process.env.ROLLBAR_TOKEN) {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  })
}

import express from 'express'
const PORT = process.env.PORT || 3000
const app = express()
import bodyParser from 'body-parser'
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

export default async function main() {
  console.log('Starting bot...')

  await dbConnect
  try {
    const client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    })

    client.on('message', async message => {
      if (
        message.content.includes('set channel') &&
        message.mentions.users.has(process.env.BOT_ID as string) &&
        message.member?.permissions.has('ADMINISTRATOR')
      ) {
        const guildId = message.guild?.id
        const channelId = message.content.includes('<#') ? message.content.split('<#')[1].replace('>', '') : false
        if (channelId) {
          try {
            const textChannel = (await client.channels.cache.get(channelId)) as TextChannel
            await textChannel.send(`👋 Hello everybody! I'll be sharing latest jobs in this channel!`)
            await GuildModel.updateOne({ id: guildId }, { channelId }, { new: true, upsert: true })
            message.reply(`✅ I'll now be sharing latest jobs in <#${channelId}> only.`)
          } catch (err) {
            message.reply(`❌ Ooops. Please give me permission to **Send Messages** in <#${channelId}> and try again!`)
          }
        } else {
          message.reply(`Please tag a channel where you'd like me to share latest jobs.`)
        }
        return
      }

      if (message.content.includes('help') && message.mentions.users.has(process.env.BOT_ID as string)) {
        HelpMessage(message, client)
        return
      }
    })

    client.on('ready', async () => {
      console.log(`Logged in as ${client.user!.tag}!`)
      let totalAudience = 0
      await InitCommands(client)

      const guilds = await client.guilds.fetch()
      for (const guild of client.guilds.cache.values()) {
        const defaultChannel = GetDefaultChannel(guild)
        console.log(guild.memberCount, '\t', guild.name, '\t', '#' + defaultChannel?.name, '(' + defaultChannel?.id + ')') // prettier-ignore
        totalAudience += guild?.memberCount || 0
      }
      console.log(`^ Live in ${guilds.size} guild(s). ${totalAudience} total audience.`)
    })

    client.on('guildCreate', async (guild: Guild) => {
      console.log(`Guild created: ${guild.name} (${guild.memberCount})`)
      await notifyWebhook(guild)
      const defaultChannel = await GetDefaultChannel(guild)
      if (defaultChannel) {
        await defaultChannel?.send(WelcomeMessage(guild))
        console.log(`Welcome message sent: ${guild.name} (${guild.memberCount})`)
      } else {
        await DMAdmin(client, guild)
        console.warn(`No default channel found: ${guild.name} (${guild.memberCount})`, guild)
      }
      RegisterCommandsInAGuild(guild)
    })
    client.on('guildDelete', (guild: Guild) => console.log('guild deleted', guild))

    await client.login(process.env.BOT_TOKEN)
    console.log('Bot is running...')

    app.all('/new-job', (req, res) => {
      const newJob = { ...req.body, ...req.query }
      PromoteNewJob(newJob, client)
      res.status(200).send(newJob)
    })

    app.all('/_health', (req, res) => {
      res.status(200).send('OK')
    })

    app.all('/channels', async (req, res) => guildsTable(req, res, client))
    app.all('/badgen/:type', async (req, res) => badgeN(req, res, client))

    const server = app.listen(PORT, () => console.log(`Server started on ${PORT}.`))

    const graceFullShutDown = () => server.close(() => console.warn('HTTP server closed'))
    process.on('SIGTERM', graceFullShutDown)
    process.on('SIGINT', graceFullShutDown)
  } catch (err) {
    console.error(`Couldn't start`, err)
    return undefined
  }
}

main()
