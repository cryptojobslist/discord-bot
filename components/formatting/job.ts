import { Job } from 'types'
import _compact from 'lodash/compact'

function isRemote(job: Job): boolean {
  if (typeof job.remote !== 'undefined') {
    return Boolean(job.remote)
  }
  return /remote|anywhere|distributed|decentralized/gi.test((job.jobLocation || '') + (job.jobTitle || ''))
}

export function salaryRange(job: Job): string {
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

export function salaryRangeV2(salary: Job['salary'], salaryRange?: string): string {
  if (salary?.minValue || salary?.maxValue) {
    const minValue = salary?.minValue ? parseInt(salary.minValue as any) : null
    const maxValue = salary?.maxValue ? parseInt(salary.maxValue as any) : null
    if (minValue === 0 && maxValue === 0) return salaryRange || ''
    let range = Array.from(new Set([minValue, maxValue])).filter(v => (v ?? 0) > 0) as number[]
    const k: 'k' | '' = Math.min(...range) / 1000 >= 1 ? 'k' : ''
    if (k === 'k') {
      range = range.map(v => (v / 1000) | 0)
    }
    const currency = salary.currency === 'USD' ? '$' : salary.currency || '$'
    return `${currency} ${range.join('-')}${k}`
  }
  if (salaryRange && salaryRange.length > 1) return salaryRange
  return ''
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
    ${jobLocation} ${salaryRangeV2(job.salary, job.salaryRange)}

    👇 Apply now or share with a friend:

    ${job.canonicalURL}
  `.replace(/^ +/gm, '')
}
