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

  if (req.query.code === 'servers') {
    res.status(200).send({
      subject: 'Servers',
      status: stats.serverCount,
      color: 'blue',
    })
  } else {
    res.status(200).send({
      subject: 'Members',
      status: Math.round(stats.memberCount / 100) / 10 + 'k+',
      color: 'green',
    })
  }
}
