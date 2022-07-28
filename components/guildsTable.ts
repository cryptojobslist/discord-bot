import { Request, Response } from 'express'
import { Client, Guild, TextChannel } from 'discord.js'
import GuildModel from '../models/Guild'

import json2html from 'json-to-table'
import _pick from 'lodash/pick'
import GetDefaultChannel from './getDefaultChannel'

export default async function guildsTable(req: Request, res: Response, client: Client) {
  if (!req.query.code || req.query.code !== process.env.ADMIN_SECRET) {
    return res.status(403).send('Forbidden')
  }

  await client.guilds.fetch()
  const data1 = await Promise.all(
    client.guilds.cache.map(async (guild: any) => {
      try {
        const guildConfig = await GuildModel.findOne({ id: guild!.id })
        const currentChannel =
          ((await client.channels.cache.get(guildConfig?.channelId)) as TextChannel) || GetDefaultChannel(guild)
        guild.channelName = currentChannel?.name || 'UNDEFINED'
      } catch (err) {
        guild.channelName = 'UNDEFINED'
      }
      return guild
    })
  )
  const data = data1
    .sort((a, b) => b.joinedTimestamp - a.joinedTimestamp)
    .map(guild => _pick(guild, ['joinedTimestamp', 'memberCount', 'name', 'channelName', 'description']))

  const stats = client.guilds.cache.reduce(
    (sum, guild) => {
      sum.memberCount += guild.memberCount
      sum.serverCount += 1
      return sum
    },
    { memberCount: 0, serverCount: 0 }
  )

  const html =
    `<html>
    <script src="https://cdn.tailwindcss.com"></script>
    <p class="p-2">Servers: ${stats.serverCount}. Members: ${stats.memberCount}.</p>
    <table class="table-auto">` +
    json2html(data).reduce((sum: string, row: string[]) => {
      return sum + `<tr>` + row.reduce((sum, column) => `${sum}<td class="p-2">${column}</td>`, '') + `</tr>`
    }, '') +
    `</table>
    </html>`
  res.status(200).set('Content-Type', 'text/html; charset=UTF-8').send(html)
}
