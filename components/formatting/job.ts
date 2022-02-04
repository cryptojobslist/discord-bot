import { Job } from 'types'

export default function (job: Job) {
  return `${job.jobTitle} at **${job.companyName}**
  ${job.remote ? '🌍' : '📍'} ${job.jobLocation?.trim()}.
  Apply now 👉 ${job.bitlyLink}`.replace(/^\s+/g, '')
}
