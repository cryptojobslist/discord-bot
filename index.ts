import {config} from "dotenv";
import { Client, Intents } from 'discord.js';
import dbConnect from './components/database';
import Guild from './models/Guild';
import HelpCommand from './commands/help';
import PromoteNewJob from './components/promoteNewJob'
import GetDefaultChannel from './components/getDefaultChannel'
import WelcomeMessage from './components/formatting/welcome'
import express from 'express'
import bodyParser from 'body-parser'


config({path: process.env.NODE_ENV === "dev" ? "./.env.dev":"./.env.prod"});

const PORT = process.env.PORT || 3000
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())


export default async function main() {
  try {
    await dbConnect();

    const client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    })

    // login to discord
    await client.login(process.env.BOT_TOKEN);
    console.log('Bot is running...');
    
    const guilds = await client.guilds.fetch();
    console.log({ guilds })
    
    // Events listeners
    client.on('message', async message => {
      if (
        message.content.includes('set channel') && 
        message.mentions.users.has(process.env.BOT_ID as string) &&
        message.member?.permissions.has('ADMINISTRATOR')
      ) {
        const guildId = message.guild?.id
        const channelId = message.content.includes('<#') ? message.content.split('<#')[1].replace('>', '') : false
        if (channelId) {
          await Guild.findOneAndUpdate({ id: guildId }, { channelId }, { new: true, upsert: true })
          message.reply(`Job notifications will now be sent to <#${channelId}>`)
        } else {
          message.reply(`Please tag a channel where you'd like job notifications to be sent to.`)
        }
      }

      if (
        message.content.includes('help') &&
        message.member?.permissions.has('ADMINISTRATOR') &&
        message.mentions.users.has(process.env.BOT_ID as string)
      ) {
        HelpCommand.fn(message)
      }
    })
    
    client.on('ready', () => console.log(`Logged in as ${client.user!.tag}!`))

    client.on('guildCreate', async (guild: any) => {
      console.log('guild created', guild)
      await guild.channels.cache.get(GetDefaultChannel(guild).id)!.send(WelcomeMessage(guild))
      console.log('welcome message sent')
    })

    client.on('guildDelete', guild => {
      console.log('guild deleted', guild)
    })


    client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return

      const { commandName } = interaction

      if (commandName === 'ping') {
        await interaction.reply('Pong!')
      } else if (commandName === 'beep') {
        await interaction.reply('Boop!')
      }
    })

    app.all('/new-job', (req, res) => {
      const newJob = { ...req.body, ...req.query }
      PromoteNewJob(newJob, client)
      res.status(200).send(newJob)
    })

    app.listen(PORT, () => console.log(`Server started on ${PORT}.`))

    console.log(`Live in ${guilds.size} guild(s):`)
    client.guilds.cache.forEach(async guild => {
      const defaultChannel = GetDefaultChannel(guild)
      console.log(guild.memberCount, guild.name, '\t', '#' + defaultChannel.name, '(' + defaultChannel.id + ')')
    })

  } catch (err) {
    console.error(`Couldn't start`, err);
    process.exit(1);
  }
}

main()
