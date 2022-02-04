import{config} from "dotenv";
import { Client, Intents } from 'discord.js';
import dbConnect from './components/database';
import Guild from './models/Guild';
import HelpCommand from './commands/help';
config({path: process.env.NODE_ENV === "dev" ? "./.env.dev":"./.env.prod"});

export default async function main() {
  await dbConnect();
  try {
    const client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    })

    client.on('message', async message => {
      console.log(message)
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
    client.on('guildCreate', console.log)
    client.on('guildDelete', console.log)

    client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return

      const { commandName } = interaction

      if (commandName === 'ping') {
        await interaction.reply('Pong!')
      } else if (commandName === 'beep') {
        await interaction.reply('Boop!')
      }
    })

    await client.login(process.env.BOT_TOKEN)
    console.log('Bot is running...')

    const guilds = await client.guilds.fetch()
    console.log({ guilds })
  } catch (err) {
    console.error(`Couldn't start`, err)
    return undefined
  }
}

main()
