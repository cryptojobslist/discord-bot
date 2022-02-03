module.exports = channel => {
  const {
    nickname,
    user: { username },
  } = channel.guild.me
  const botNickname = nickname || username
  return `Hi! I'm Crypto Jobs List bot for Discord! I'll be sharing latest crypto jobs with you 😉. Type \`@${botNickname} for help\`.`
}
