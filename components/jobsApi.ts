import { Job } from 'types'
const fetch = require('node-fetch')

interface filters {
  [key: string]: string
}

interface FindByBidResponse {
  data: {
    jobs: Job[]
    oldJobs: Job[]
  }
  seo: {
    title: string
    description: string
  }
}

export async function fetchJobs(params: filters = {}): Promise<any> {
  const response = await fetch('https://api.cryptojobslist.com/job/findbybid', {
    method: 'post',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
  const data = (await response.json()) as FindByBidResponse
  return data.data.jobs
}

export async function fetchOneById(id: string): Promise<Job> {
  const response = await fetch(`https://api.cryptojobslist.com/job/${id}`)
  const job = (await response.json()) as Job
  return job
}
