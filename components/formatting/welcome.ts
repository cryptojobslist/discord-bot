export default function (guild) {
  const {
    nickname,
    user: { username },
  } = guild.me
  const botNickname = nickname || username
  return `
    Hi 👋 I'm Crypto Jobs List bot for Discord.
    I'll be sharing latest crypto, web3 and blockchain jobs with you 😉.

    Type \`@${botNickname} help\` for help.
    Type \`@${botNickname} set channel #channel-name\` to set a different channel for me.
    Check <https://github.com/cryptojobslist/discord-bot> for feedback and feature requests.
  `.replace(/^ +/gm, '')
}
