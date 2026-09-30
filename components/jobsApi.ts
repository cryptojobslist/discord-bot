import { Job } from 'types'
import fetch from 'node-fetch'

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

type FrontendJob = Record<string, unknown> & {
  id: string;
  jobTitle: string;
  companyName: string;
  seoSlug: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && Boolean(value.trim());
}

function isFrontendJob(value: unknown): value is FrontendJob {
  return (
    isRecord(value) &&
    isNonBlankString(value.id) &&
    isNonBlankString(value.jobTitle) &&
    isNonBlankString(value.companyName) &&
    isNonBlankString(value.seoSlug)
  );
}

export async function fetchJobs(params: filters = {}): Promise<Job[]> {
  const response = await fetch('https://api.cryptojobslist.com/job/findbybid', {
    method: 'post',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
  const data = (await response.json()) as FindByBidResponse
  return data.data.jobs
}

export async function fetchOneById(id: string): Promise<Job> {
  if (typeof id !== 'string' || !id.trim()) throw new Error('Job ID is required');

  const jobId = id.trim();
  const response = await fetch(`https://cryptojobslist.com/api/jobs/${encodeURIComponent(jobId)}?disableRedirect=true`, {
    headers: {
      Accept: 'application/json',
      'sec-fetch-site': 'same-origin',
      referer: 'https://cryptojobslist.com',
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch job ${jobId} from frontend API: HTTP ${response.status}`);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Failed to fetch job ${jobId} from frontend API: invalid JSON response`);
  }

  if (!isRecord(payload) || !isFrontendJob(payload.job)) {
    throw new Error(`Failed to fetch job ${jobId} from frontend API: missing or invalid job data`);
  }

  return {
    ...payload.job,
    canonicalURL: `https://cryptojobslist.com/jobs/${encodeURIComponent(payload.job.seoSlug)}`,
  } as Job;
}
