import * as Sentry from '@sentry/node'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { Client, Guild } from 'discord.js'
import GuildModel from '../models/Guild'

type ApplicationCommand = { id: string; name: string; type: number }
type MigrationOutcome = 'completed' | 'skipped' | 'already-migrated'
type MigrationResult = { outcome: MigrationOutcome; deleted: number }

const CHAT_INPUT_COMMAND = 1
const migrationVersion = 1
const legacyCommandNames = new Set(['set-channel', 'help'])
let rest: REST | undefined

function getStatus(error: any) {
  return error?.status
}

function getDiscordErrorCode(error: any) {
  return error?.rawError?.code || error?.code
}

function isSkippedGuildError(error: any) {
  const code = getDiscordErrorCode(error)
  return code === 50001 || code === 10004
}

function isUnknownCommand(error: any) {
  return getDiscordErrorCode(error) === 10063
}

async function isMigrationRecorded(guildId: string, applicationId: string, retrySkipped: boolean) {
  const outcomes = retrySkipped ? ['completed'] : ['completed', 'skipped']
  return GuildModel.exists({
    id: guildId,
    'legacyGuildCommandMigration.applicationId': applicationId,
    'legacyGuildCommandMigration.version': migrationVersion,
    'legacyGuildCommandMigration.outcome': { $in: outcomes },
  })
}

async function recordMigration(guildId: string, applicationId: string, outcome: Exclude<MigrationOutcome, 'already-migrated'>) {
  await GuildModel.updateOne(
    { id: guildId },
    {
      $set: {
        legacyGuildCommandMigration: {
          applicationId,
          version: migrationVersion,
          outcome,
          attemptedAt: new Date(),
        },
      },
    },
    { upsert: true }
  )
}

function getRestClient(token: string) {
  if (!rest) rest = new REST({ version: '9' }).setToken(token)
  return rest
}

function reportUnexpectedMigrationError(guildId: string, error: any) {
  console.error(
    `Guild command migration failed: guild=${guildId} status=${getStatus(error) || 'unknown'} code=${
      getDiscordErrorCode(error) || 'unknown'
    }`,
    error
  )
  Sentry.captureException(error)
}

export async function migrateLegacyGuildCommandsForGuild(guild: Pick<Guild, 'id'>, retrySkipped = false): Promise<MigrationResult> {
  const applicationId = process.env.BOT_ID
  const token = process.env.BOT_TOKEN
  if (!applicationId || !token) throw new Error('BOT_ID and BOT_TOKEN are required to migrate guild commands.')

  try {
    if (await isMigrationRecorded(guild.id, applicationId, retrySkipped)) {
      return { outcome: 'already-migrated', deleted: 0 }
    }

    const restClient = getRestClient(token)
    const commands = (await restClient.get(
      Routes.applicationGuildCommands(applicationId, guild.id)
    )) as unknown as ApplicationCommand[]

    let deleted = 0
    for (const command of commands) {
      if (command.type !== CHAT_INPUT_COMMAND || !legacyCommandNames.has(command.name)) continue

      try {
        await restClient.delete(Routes.applicationGuildCommand(applicationId, guild.id, command.id))
        deleted += 1
      } catch (error) {
        if (isUnknownCommand(error)) continue
        throw error
      }
    }

    await recordMigration(guild.id, applicationId, 'completed')
    return { outcome: 'completed', deleted }
  } catch (error) {
    if (isSkippedGuildError(error)) {
      try {
        await recordMigration(guild.id, applicationId, 'skipped')
      } catch (recordError) {
        reportUnexpectedMigrationError(guild.id, recordError)
        throw recordError
      }
      console.log(
        `Guild command migration: guild=${guild.id} outcome=skipped status=${getStatus(error) || 'unknown'} code=${
          getDiscordErrorCode(error) || 'unknown'
        }`
      )
      return { outcome: 'skipped', deleted: 0 }
    }

    reportUnexpectedMigrationError(guild.id, error)
    throw error
  }
}

export async function migrateLegacyGuildCommands(bot: Client) {
  let scanned = 0
  let completed = 0
  let skipped = 0
  let alreadyMigrated = 0
  let failures = 0
  let commandsDeleted = 0
  let after: string | undefined

  while (true) {
    const guilds = await bot.guilds.fetch(after ? { limit: 200, after } : { limit: 200 })
    for (const guild of guilds.values()) {
      scanned += 1
      try {
        const result = await migrateLegacyGuildCommandsForGuild(guild)
        const { outcome } = result
        commandsDeleted += result.deleted
        if (outcome === 'completed') completed += 1
        if (outcome === 'skipped') skipped += 1
        if (outcome === 'already-migrated') alreadyMigrated += 1
      } catch {
        failures += 1
      }
    }

    if (guilds.size < 200) break
    after = [...guilds.keys()].pop()
  }

  console.log(
    `Guild command migration summary: scanned=${scanned} completed=${completed} deleted=${commandsDeleted} skipped=${skipped} already-migrated=${alreadyMigrated} failures=${failures}`
  )
}
