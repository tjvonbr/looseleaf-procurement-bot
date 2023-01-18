const { App } = require("@slack/bolt");
const dotenv = require("dotenv");
const cron = require("node-cron");
const { calculateInventory } = require("./inventory-check");

dotenv.config();

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

(async () => {
  const port = 3000;

  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);

  cron.schedule("0 9 * * 5", calculateInventory);
})();

module.exports = { app };
