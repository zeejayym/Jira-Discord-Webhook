# Jira to Discord Webhook

This is a Node.js webhook that listens to Jira issue updates and sends formatted notifications to a Discord channel. I use https://glitch.com/ to host it, a wonderful recent discovery for small projects, and instead of cloning the directory you can just use the hosted webhook yourself: https://glitch.com/~splashy-nonchalant-inch

## Features

- Extracts issue details (key, summary, changes, etc.) from Jira webhook payloads.
- Sends detailed notifications, including the specific changes (e.g., updated fields) to Discord.
- Generates correct Jira issue links for easy access.

## Setup

1. **Environment Variables**:

   - Add your Discord Webhook URL to a `.env` file:
     ```
     DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
     ```

2. **Install Dependencies**:

   ```bash
   npm install

   ```

3. **Deploy**

- Host the project on a platform like Glitch or any Node.js-compatible service.

4. **Configure Jira Webhook:**

- Add a webhook in Jira pointing to:
  https://splashy-nonchalant-inch/webhook
