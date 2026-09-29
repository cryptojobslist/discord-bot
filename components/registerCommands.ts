import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { getCommandDefinitions } from '../commands'

export default async function registerGlobalCommands() {
  const applicationId = process.env.BOT_ID
  const token = process.env.BOT_TOKEN
  if (!applicationId || !token) throw new Error('BOT_ID and BOT_TOKEN are required to deploy commands.')

  const rest = new REST({ version: '9' }).setToken(token)
  console.log('Deploying global application commands...')
  for (const command of getCommandDefinitions()) {
    await rest.post(Routes.applicationCommands(applicationId), { body: command })
  }
  console.log('Global application commands deployed.')
}
