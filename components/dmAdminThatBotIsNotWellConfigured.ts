import { Client, Guild } from 'discord.js'

export default async function DMAdmin(client: Client, guild: Guild, message?: string) {
  try {
    const adminUser = await client.users.fetch(guild.ownerId)
    await adminUser.send(
      message ||
        `Thanks for adding ${client.user!.username} bot to **${guild.name}**.

      - Please **run \`/set-channel\` (while in your Server) to set a default channel** for the bot AND
      - ensure it has **messaging permissions**.

      Otherwise the bot wont be able to send new jobs to your community.

      p.s.
      If the \`/set-channel\` command doesn't appear, please re-install the bot.
      If you have questions of things don't work, contact us on Twitter @CryptoJobsList
    `.replace(/^ +/gm, '')
    )
    console.warn(`DMed to admin of ${guild.name}`)
  } catch (err) {
    console.error(`Failed to DM admins of ${guild.name}`, err)
  }
}
