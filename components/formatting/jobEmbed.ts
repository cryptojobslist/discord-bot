import { MessageEmbed } from 'discord.js'
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
    return `${job.salaryRange}`
  } else if (job.salary?.minValue || job.salary?.maxValue) {
    return `${_compact([job.salary.minValue, job.salary.maxValue]).join(' - ')} ${job.salary.currency || 'USD'}/${
      job.salary.unitText?.toLowerCase() || 'year'
    }`
  } else {
    return ''
  }
}

export default function (job: Job) {
  const jobLocation = (() => {
    if (isRemote(job)) return 'Remote'
    if (job.jobLocation) return job.jobLocation.trim()
    return 'Remote'
  })()

  console.log(jobLocation)
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(job.jobTitle)
    .setURL(job.canonicalURL + '?utm_source=discordbot&utm_medium=social')
    .setAuthor({
      name: `${job.companyName} is hiring:`,
      iconURL: job.companyLogo,
      url: `https://cryptojobslist.com/companies/${job.companySlug}`,
    })
    // .setDescription(job.jobDescription)
    .setThumbnail(`https://cryptojobslist.com/favicon.png`)
    .addFields(
      // { name: 'Regular field title', value: 'Some value here' },
      // { name: '\u200B', value: '\u200B' },
      { name: 'Location:', value: jobLocation, inline: true },
      { name: 'Category:', value: job.category, inline: true },
      { name: 'Type:', value: job.employmentType.join(', '), inline: true }
      // { name: 'Salary range', value: salaryRange(job), inline: false }
    )
    // .addField('Inline field title', 'Some value here', true)
    .setImage(`https://lambda-apis.vercel.app/api/ogImage2/${job.id}.png`)
    .setTimestamp()
    .setFooter({
      text: 'Apply now or share with a fren!',
      // iconURL: 'https://i.imgur.com/AfFp7pu.png'
    })

  if (salaryRange(job)) {
    embed.addField('Salary range:', salaryRange(job), true)
  }

  return embed
}
