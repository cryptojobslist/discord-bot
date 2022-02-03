module.exports = (msg: any) => {
  const {
    nickname,
    user: { username },
  } = msg.guild.me
  const botNickname: string = nickname || username
  return `If you want for bot to join specific channel, type \`@${botNickname} join\`. If you want it to leave: \`@${botNickname} leave\`.`
}
