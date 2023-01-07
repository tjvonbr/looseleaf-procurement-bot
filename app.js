import pkg from "@slack/bolt";
const { App } = pkg;
import sppullPkg from "sppull";
const { SPPull } = sppullPkg;
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const siteUrl =
  "https://looseleaf420.sharepoint.com/sites/LooseLeafDominicanaGlobalHub";

const context = {
  siteUrl,
  creds: {
    username: process.env.MICROSOFT_USERNAME,
    password: process.env.MICROSOFT_PASSWORD,
    online: true,
  },
};

const options = {
  spRootFolder: "Shared Documents",
  dlRootFolder: "./downloaded-inventory",
};

// delete stale files to make room for updated ones
fs.rmSync("./downloaded-inventory", { recursive: true, force: true });

await SPPull.download(context, options)
  .then((downloadResults) => {
    console.log(downloadResults);
    console.log("Files are downloaded");
    console.log(
      "For more, please check the results",
      JSON.stringify(downloadResults)
    );
  })
  .catch((err) => {
    console.log("Core error has happened", err);
  });

(async () => {
  const port = 3000;

  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();

export default app;
