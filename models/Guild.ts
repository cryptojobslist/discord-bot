import mongoose from 'mongoose'
import { createSchema, Type, typedModel } from 'ts-mongoose'

const GuildSchema = createSchema(
  {
    id: Type.string({ required: true, unique: true, index: true }),
    channelId: Type.string(),
    filters: Type.mixed(),
    members: Type.number(),
    guildName: Type.string(),
    guildURL: Type.string(),
  },
  { timestamps: true, collection: 'guild' }
)

export default mongoose.models.Guild || typedModel('Guild', GuildSchema)
