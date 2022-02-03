import { Job } from 'types'
import dbConnect from 'libs/database'
import { Types } from 'mongoose'
import Guild from 'models/Guild'

module.exports = async (job: Job, client: any) => {
  await dbConnect
}
