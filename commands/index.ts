import { Client } from 'discord.js';
import * as Sentry from '@sentry/node';
import SetChannel from './setChannel'
import Help from './help'
import _find from 'lodash/find'

export const commands = [SetChannel, Help];

export function getCommandDefinitions() {
  return commands
    .filter(command => command.name && command.fn)
    .map(command => ({
      name: command.name,
      description: command.description,
      options: (command as any).options || [],
      dm_permission: false,
    }));
}

export default function AttachCommandHandler(bot: Client) {
  bot.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    try {
      const command = _find(commands, { name: interaction.commandName })
      if (command?.fn) return await command.fn(interaction)
      await interaction.reply(`Not sure I understood you.`)
    } catch (err) {
      console.error('Error responding to a command', err)
      Sentry.captureException(err);
      await interaction.reply(`Something went wrong. Please contact our support.`)
    }
  })
}
