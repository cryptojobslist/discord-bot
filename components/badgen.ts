import { Request, Response } from 'express'
import { Client } from 'discord.js'

type Stats = {
  memberCount: number
  serverCount: number
}

let cache: { data: Stats | any; createdAt: number } = { data: undefined, createdAt: 0 }
async function getStatsWithCache(client: Client): Promise<Stats> {
  return new Promise(async (resolve) => {
    if (cache.data) resolve(cache.data)
    if (!cache.data || Date.now() > cache.createdAt + 10_000) {
      await client.guilds.fetch()
      const stats = client.guilds.cache.reduce(
        (sum, guild) => {
          sum.memberCount += guild.memberCount
          sum.serverCount += 1
          return sum
        },
        { memberCount: 0, serverCount: 0 }
      )
      cache.data = stats
      cache.createdAt = Date.now()
    }
    resolve(cache.data)
  })
}

export default async function badgeN(req: Request, res: Response, client: Client) {
  const stats: Stats = await getStatsWithCache(client)

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
