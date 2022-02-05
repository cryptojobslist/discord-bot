export interface Job {
  id: string
  jobTitle: string
  jobLocation: string
  jobDescription: string
  companyName: string
  companyUrl: string
  companyLogo: string
  companySlug: string
  company?: Company | string | null
  employmentType: Array<string>
  category: string
  bossPicture: string
  bossFirstName: string
  bossLastName: string
  bossName: string
  skills: string
  salaryRange: string
  salary?: {
    minValue: number
    maxValue: number
    currency: string | 'USD'
    unitText: 'YEAR' | 'MONTH' | 'WEEK' | 'HOUR'
  }
  paysInFiat: boolean
  paysInCrypto: boolean

  applicationLink?: string
  bitlyLink: string
  seoSlug: string
  canonicalURL: string
  remote: boolean

  createdAt: string
  featuredAt: string
  isFeatured: boolean

  published: boolean
  publishedAt: string
  directApplicationsQty: number
  applicationLinkClicks: number
}

export interface Company {
  id: string
  name: string
  url: string
  logo: string
  logoDarkMode?: string | null
  twitter: string | null
  github: string | null
  coinSymbol: string | null
  tags: string[] | null
  bossName: string | null
  bossFirstName: string
  bossLastName: string | null
  bossPicture: string
  slug: string
  coverImage: string | null
  ogImage: string | null
  lastActiveAt: string
  about: string
  culture: string | null
  interviewProcess: string
  techStack: string | null
  vacationPolicy: string
  currentTeam: string
  funding: string
  linkedin: string
  foundedDate: string
  location: string
  createdAt: string
  updatedAt: string
}
