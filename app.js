require("dotenv").config();
const { App } = require("@slack/bolt");
const cron = require("node-cron");
const { calculateInventory } = require("./inventory-check");
const { updateAsanaInventory } = require("./asana-inventory");

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

  // List of cron jobs
  cron.schedule("0 9 * * 5", calculateInventory); // Runs every Friday at 9am
  // cron.schedule("*/10 * * * * *", updateAsanaInventory); //  Runs every 5 minutes
})();

module.exports = { app };
