import fetch from 'node-fetch'
import { Guild } from 'discord.js'

export default async function notifyWebhook(guild: Guild) {
  if (process.env.NEW_SERVER_JOINED_HOOK) {
    await fetch(process.env.NEW_SERVER_JOINED_HOOK as string, {
      method: 'post',
      body: JSON.stringify({
        content: 'New server started using https://cryptojobslist.com/go/discord-bot!',
        embeds: [
          {
            fields: [
              {
                name: 'Name',
                value: guild.name || 'Unknown',
                inline: true,
              },
              {
                name: 'Members',
                value: String(guild.memberCount),
                inline: true,
              },
              {
                name: 'Description',
                value: guild.description || 'No description',
                inline: true,
              },
            ],
          },
        ],
      }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(err => console.error('Failed to send webhook notification', err))
  }
}
