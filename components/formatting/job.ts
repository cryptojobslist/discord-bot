import { Job } from 'types'
import _compact from 'lodash/compact'

function isRemote(job: Job): boolean {
  if (typeof job.remote === 'undefined') {
    job.remote = /remote|anywhere|distributed|decentralized/gi.test(job.jobLocation + job.jobTitle)
  }
  return Boolean(job.remote)
}

function salaryRange(job: Job): string {
  if (job.salaryRange && !/competitive|nego/gi.test(job.salaryRange)) {
    return `\n💰 ${job.salaryRange}`
  } else if (job.salary?.minValue || job.salary?.maxValue) {
    return `\n💰 ${_compact([job.salary.minValue, job.salary.maxValue]).join(' - ')} ${job.salary.currency || 'USD'}/${
      job.salary.unitText?.toLowerCase() || 'year'
    }`
  } else {
    return ''
  }
}

export default function (job: Job) {
  const jobLocation = (() => {
    if (isRemote(job)) return '🌍 Remote'
    if (job.jobLocation) return `📍 ${job.jobLocation.trim()}`
    return ''
  })()

  return `
    💼 ${job.jobTitle} at
    🏛️ ${job.companyName}
    ${jobLocation} ${salaryRange(job)}

    👇 Apply now or share with a friend:

    ${job.canonicalURL}
  `.replace(/^ +/gm, '')
}
