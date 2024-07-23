require('dotenv').config()
import { Client as DiscordClient, Intents, TextChannel, Guild } from 'discord.js'
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
const server = express()
import bodyParser from 'body-parser'
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(bodyParser.raw())

export default async function main() {
  console.log('Starting bot...')

  await dbConnect
  try {
    const bot = new DiscordClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

    bot.on('message', async message => {
      if (
        message.content.includes('set channel') &&
        message.mentions.users.has(process.env.BOT_ID as string) &&
        message.member?.permissions.has('ADMINISTRATOR')
      ) {
        const guildId = message.guild?.id
        const channelId = message.content.includes('<#') ? message.content.split('<#')[1].replace('>', '') : false
        if (channelId) {
          try {
            const textChannel = (await bot.channels.cache.get(channelId)) as TextChannel
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
        HelpMessage(message, bot)
        return
      }
    })

    bot.on('ready', async () => {
      console.log(`Logged in as ${bot.user!.tag}!`)
      let totalAudience = 0
      const guilds = await bot.guilds.fetch({ limit: 200 })

      await InitCommands(bot)

      for (const guild of bot.guilds.cache.values()) {
        const defaultChannel = GetDefaultChannel(guild)
        console.log(guild.memberCount, '\t', guild.name, '\t', '#' + defaultChannel?.name, '(' + defaultChannel?.id + ')') // prettier-ignore
        totalAudience += guild?.memberCount || 0
      }
      console.log(`^ Live in ${guilds.size} guild(s). ${totalAudience} total audience.`)
    })

    bot.on('guildCreate', async (guild: Guild) => {
      console.log(`Guild created: ${guild.name} (${guild.memberCount})`)
      await notifyWebhook(guild)
      const defaultChannel = await GetDefaultChannel(guild)
      if (defaultChannel) {
        await defaultChannel?.send(WelcomeMessage(guild))
        console.log(`Welcome message sent: ${guild.name} (${guild.memberCount})`)
      } else {
        await DMAdmin(bot, guild)
        console.warn(`No default channel found: ${guild.name} (${guild.memberCount})`, guild)
      }
      RegisterCommandsInAGuild(guild)
    })
    bot.on('guildDelete', (guild: Guild) => console.log('guild deleted', guild))

    console.log('Discord login: STARTING...')
    bot
      .login(process.env.BOT_TOKEN)
      .catch(err => console.error('Discord login: ERROR', err))
      .then(() => {
        console.log('Discord login: DONE')
      })

    server.all('/new-job', (req, res) => {
      const newJob = { ...req.body, ...req.query }
      PromoteNewJob(newJob, bot)
      res.status(200).send(newJob)
    })

    server.all('/', (req, res) => res.status(200).send('OK'))
    server.all('/_health', (req, res) => res.status(200).send('OK'))

    server.all('/channels', async (req, res) => guildsTable(req, res, bot))
    server.all('/badgen/:type', async (req, res) => badgeN(req, res, bot))

    const serverInstance = server.listen(PORT, () => console.log(`Server started on ${PORT}.`))

    async function graceFullShutDown() {
      serverInstance.close(() => console.warn('HTTP server closed'))
      await bot.destroy()
      process.exit(0)
    }
    process.on('SIGTERM', graceFullShutDown)
    process.on('SIGINT', graceFullShutDown)
  } catch (err) {
    console.error(`Couldn't start`, err)
    process.exit(0)
  }
}

main()
