import { Interaction } from 'discord.js'

export default {
  name: 'help',
  description: 'List all commands',
  // fn: async (interaction: Interaction) => {
  fn: async (interaction: any) => {
    await interaction.reply(
      'For help and feedback, please contact us at <https://cryptojobslist.com/go/discord> or check out and contribute to our git repo <https://github.com/cryptojobslist/discord-bot>'
    )
  },
}
