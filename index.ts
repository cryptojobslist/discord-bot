require('dotenv').config()
import { Client, Intents } from 'discord.js'

export default async function main() {
  console.log('Starting bot...')
  try {
    const client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    })

    client.on('ready', () => {
      console.log(`Logged in as ${client.user!.tag}!`)
    })

    client.on('message', message => {
      // console.log(message)
      // if (message.content.includes('ping')) {
      //   message.reply('pong')
      // }
    })

    client.on('guildCreate', console.log)

    client.on('guildDelete', console.log)

    // client.on('interactionCreate', async interaction => {
    //   if (!interaction.isCommand()) return

    //   const { commandName } = interaction

    //   if (commandName === 'ping') {
    //     await interaction.reply('Pong!')
    //   } else if (commandName === 'beep') {
    //     await interaction.reply('Boop!')
    //   }
    // })

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
