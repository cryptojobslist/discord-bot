import mongoose from 'mongoose'
declare const process: any

async function dbConnect() {
  // check if we have a connection to the database or if it's currently
  // connecting or disconnecting (readyState 1, 2 and 3)
  if (mongoose.connection.readyState >= 1) return
  console.log(`Connecting to ${process.env.NODE_ENV} database...`)
  return mongoose
    .connect(process.env.MONGO_URL, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useFindAndModify: false,
      // useCreateIndex: true,
    })
    .then(() => {
      console.log('Connected to the database.')
    })
    .catch(err => {
      console.error(`Couldn't connect to database`, err)
      return undefined
    })
}

let connectionPromise = dbConnect()

export default connectionPromise
