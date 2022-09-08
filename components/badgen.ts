import { Request, Response } from 'express'
import { Client } from 'discord.js'

export default async function badgeN(req: Request, res: Response, client: Client) {
  await client.guilds.fetch()
  const stats = client.guilds.cache.reduce(
    (sum, guild) => {
      sum.memberCount += guild.memberCount
      sum.serverCount += 1
      return sum
    },
    { memberCount: 0, serverCount: 0 }
  )

  let result = {}
  if (req.params.type === 'servers') {
    result = {
      subject: 'Servers',
      status: stats.serverCount,
      color: 'blue',
    }
  } else if (req.params.type === 'members') {
    result = {
      subject: 'Members',
      status: Math.round(stats.memberCount / 100) / 10 + 'k+',
      color: 'green',
    }
  }

  res.set('Cache-control', 'public, max-age=300').status(200).send(result)
}
