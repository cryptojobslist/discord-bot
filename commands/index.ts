import includeAll from 'include-all'
import { Client, Guild } from 'discord.js'
import SetChannel from './setChannel'
import Help from './help'
import _find from 'lodash/find'

const commands = [SetChannel, Help]

export default async function Init(client: Client) {
  // TODO:
  // const commands = includeAll({
  //   dirname: './commands/*',
  //   filter: /(.+)\.js$/,
  //   excludeDirs: /^\.(git|svn)$/,
  //   optional: true,
  // })

  const guilds = await client.guilds.fetch()
  for (const guild of client.guilds.cache.values()) {
    await RegisterCommandsInAGuild(guild)
  }

  client.on('interactionCreate', async interaction => {
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
}

export function RegisterCommandsInAGuild(guild: Guild) {
  for (const command of commands) {
    if (!command.name && !command.fn) continue
    guild.commands?.create({
      name: command.name,
      description: command.description,
      options: (command as any).options || null,
    })
  }
}
