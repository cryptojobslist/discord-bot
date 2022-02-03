import { Job } from 'types'

module.exports = (job: Job) =>
  `${job.jobTitle} at **${job.companyName}** ${job.remote ? '🌍' : '📍'} ${job.jobLocation}. Apply now 👉 ${
    job.bitlyLink
  }`
