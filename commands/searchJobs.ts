import { Client } from 'discord.js'
import dbConnect from 'components/database'
import { Types } from 'mongoose'
import Guild from 'models/Guild'

module.exports = async (client: Client, message: any) => {
  await dbConnect
}
