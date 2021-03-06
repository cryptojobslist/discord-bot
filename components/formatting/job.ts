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
    return `\nš° ${job.salaryRange}`
  } else if (job.salary?.minValue || job.salary?.maxValue) {
    return `\nš° ${_compact([job.salary.minValue, job.salary.maxValue]).join(' - ')} ${job.salary.currency || 'USD'}/${
      job.salary.unitText?.toLowerCase() || 'year'
    }`
  } else {
    return ''
  }
}

export default function (job: Job) {
  const jobLocation = (() => {
    if (isRemote(job)) return 'š Remote'
    if (job.jobLocation) return `š ${job.jobLocation.trim()}`
    return ''
  })()

  return `
    š¼ ${job.jobTitle} at
    šļø ${job.companyName}
    ${jobLocation} ${salaryRange(job)}

    š Apply now or share with a friend:

    ${job.canonicalURL}
  `.replace(/^ +/gm, '')
}
