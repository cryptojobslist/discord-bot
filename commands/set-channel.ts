import dbConnect from 'libs/database'
import { Types } from 'mongoose'
import Guild from 'models/Guild'

module.exports = async (client: any, message: any) => {
  await dbConnect
  const channelId = message.channel.id
  const guild = await Guild.updateOne(
    {
      id: message.guild.id,
      channelId,
    },
    {
      upsert: true,
    }
  )
}
