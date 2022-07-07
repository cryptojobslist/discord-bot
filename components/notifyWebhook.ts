import fetch from 'node-fetch'

export default async function notifyWebhook(guild) {
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
                value: guild.name,
                inline: true,
              },
              {
                name: 'Members',
                value: guild.memberCount,
                inline: true,
              },
              {
                name: 'Description',
                value: guild.description,
                inline: true,
              },
            ],
          },
        ],
      }),
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return
}
