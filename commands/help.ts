import { Interaction } from 'discord.js'

export default {
  name: 'help',
  description: 'List all commands',
  // fn: async (interaction: Interaction) => {
  fn: async (interaction: any) => {
    await interaction.reply(
      `
      I'll be sharing latest crypto, web3 and blockchain jobs with you 😉.

      Type \`set channel #channel-name\` to set a different channel for me.

      Check <https://github.com/cryptojobslist/discord-bot> for feedback and feature requests.
      Or contact us at <https://cryptojobslist.com/go/discord>.
      `.replace(/^ +/gm, '')
    )
  },
}
