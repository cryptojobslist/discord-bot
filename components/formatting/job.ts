import { Job } from 'types'

export default function (job: Job) {
  return `${job.jobTitle} at **${job.companyName}** ${job.remote ? '🌍' : '📍'} ${job.jobLocation}. Apply now 👉 ${
    job.bitlyLink
  }`
}
