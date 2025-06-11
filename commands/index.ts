import includeAll from 'include-all'
import { Client, Guild } from 'discord.js'
import SetChannel from './setChannel'
import Help from './help'
import _find from 'lodash/find'

const commands = [SetChannel, Help]

export default async function Init(bot: Client) {
  // TODO:
  // const commands = includeAll({
  //   dirname: './commands/*',
  //   filter: /(.+)\.js$/,
  //   excludeDirs: /^\.(git|svn)$/,
  //   optional: true,
  // })

  const guilds = bot.guilds.cache.values()
  console.log(`Registering commands in ${bot.guilds.cache.size} guilds...`)

  for (const guild of guilds) {
    await RegisterCommandsInAGuild(guild).catch(err =>
      console.error('Error registering commands in guild', guild.id, err)
    )
  }

  bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    try {
      const command = _find(commands, { name: interaction.commandName })
      if (command?.fn) return await command.fn(interaction)
      await interaction.reply(`Not sure I understood you.`)
    } catch (err) {
      console.error('Error responding to a command', err)
      await interaction.reply(`Something went wrong. Please contact our support.`)
    }
  })

  console.log('Commands registered.')
}

export async function RegisterCommandsInAGuild(guild: Guild) {
  for (const command of commands) {
    if (!command.name && !command.fn) continue
    await guild.commands
      ?.create({
        name: command.name,
        description: command.description,
        options: (command as any).options || null,
      })
      .catch(err => console.error('Error registering command', command.name, err))
  }
}
