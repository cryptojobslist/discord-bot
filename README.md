![In servers](https://badgen.net/https/discord-bot.cryptojobslist.com/badgen/servers?icon=discord) ![Current audience across all servers](https://badgen.net/https/discord-bot.cryptojobslist.com/badgen/members?icon=discord)

# 💼 Receive latest Crypto & Web3 Jobs in your Discord
> Help your community afford your NFTs by getting them a job! Add [this bot](https://discord.com/oauth2/authorize?client_id=458880791573954570&permissions=2147485696&scope=bot) to your Discord for latest jobs from the top companies in crypto & web3.

1. 🤖 [Add to Discord](https://discordapp.com/api/oauth2/authorize?client_id=458880791573954570&permissions=2147485696&scope=bot)
2. #️⃣ Create a new channel for job notifications. Example: `#crypto-jobs-list`
3. 💬 Give our bot **Messaging Permissions** in your channel. Otherwise the bot won't work! ⚠️
4. 👉 Run `/set-channel #channel-name` to tell the bot which channel it should send jobs to
5. ✅ Done! Confirmation should look like this:

<img width="468" alt="Crypto Jobs List Discord Bot" src="https://user-images.githubusercontent.com/936436/187341582-1db2b2d1-3bd7-482e-a15b-204e3252f13a.png">

<img width="468" alt="Crypto Jobs List Discord Bot" src="https://user-images.githubusercontent.com/936436/187341614-dfe83f86-b444-495e-a49b-7ad7e8b8a13c.png">

## Here is the /set-channel process:
<img width="700" alt="Crypto Jobs List Discord Bot" src="https://user-images.githubusercontent.com/936436/187342403-c1f015b3-ff08-4f22-8b1a-86b8b080cfc2.gif">


# What it looks like:

<img width="800" alt="Crypto Jobs List Discord Bot" src="https://user-images.githubusercontent.com/936436/177785495-e231602e-c4b2-41a1-b5fe-e9de68428576.png">


## Features
- Receive real-time notifications about new jobs in crypto/web3
- Your server mods can select which channel to send these notifications to. Type `/set-channel #channel-name` to set a different channel. Defaults to `#general`
- No other features. Super simple!
- PRs and suggestions are welcome 😅

## Error monitoring

The bot reports errors to Sentry when `SENTRY_DSN` is set. Add the DSN to your deployment's private environment
variables, or to a local `.env` file copied from `.env.example`. You can optionally set `SENTRY_ENVIRONMENT` to label
events; otherwise the bot uses `NODE_ENV`. Leave `SENTRY_DSN` unset to disable Sentry.

Do not commit a real DSN or other credentials. `.env` and `.env.production` are ignored by Git. The bot omits request
data and breadcrumbs from Sentry errors because the `/channels` route receives an admin secret in its query string.
Existing Rollbar reporting remains available through `ROLLBAR_TOKEN`.

## Slash command deployment

`/set-channel` and `/help` are global application commands. A normal production deploy registers them automatically
when the bot becomes ready; no separate command-deployment step is required.

Global command updates may take time to appear. Discord performs read repair when a user invokes a stale command. This
deployment runs during bot startup, so restarts and new guild joins do not create guild-scoped commands.
Each command is upserted independently, preserving unrelated global application commands.

### Automatic legacy guild-command migration

Older deployments created guild-scoped copies of `/set-channel` and `/help`. After global registration succeeds, the
bot removes those copies in the background. It deletes only chat-input commands with those names, preserving unrelated
guild commands, including user and message commands with the same names. Migration progress is stored per guild,
application ID, and migration version in MongoDB, so completed and skipped guilds are not rescanned after restarts.
Missing Access and Unknown Guild results are recorded as skipped; unexpected failures are reported to Sentry and retried
on a later startup. A re-added guild retries a prior skipped migration.


## How do add to your Server
1. Use [this link](https://cryptojobslist.com/go/discord-bot) or [this one](https://discord.com/oauth2/authorize?client_id=458880791573954570&permissions=2147485696&scope=bot) to add to your server.
2. Ensure the bot has messaging permissions in the channel you'd like it to post to.
3. Tell the bot which channel you'd like to send jobs to: type `/set-channel #channel-name`
4. 🍻 Congratulate your community! They'll be getting jobs soon 🚀


## Security
- This bot can only Send Messages.
- This bot can only send job notifications and only in the format shown in the screenshot above.
- This bot **can't** do anything else: can't read messages, can't manage channels, can't send spam, etc. It can't even read it's own messages!
- It's open source. If in doubt — read the code, ask questions, leave comments, suggest improvements.

<img width="426" alt="image" src="https://user-images.githubusercontent.com/936436/187343520-7d6374d6-f8b6-4679-a3b7-c4f2498e5cd3.png">
