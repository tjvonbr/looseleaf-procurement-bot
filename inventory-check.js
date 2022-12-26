const { app } = require("./app.js");
const cron = require("node-cron");
const xlsx = require("xlsx");

cron.schedule("*/5 * * * * *", async () => {
  try {
    const flavorsWorkbook = await xlsx.readFile("./flavors.xlsm");
    const flavorsWorksheet = flavorsWorkbook.Sheets["Inventory Test"];

    const flavorsData = xlsx.utils.sheet_to_json(flavorsWorksheet);
    const flavors = flavorsData.slice(1);

    const flavorsToReorder = [];
    const gallonsRemaining = [];

    let flavorsMessage, gallonsMessage;

    for (const flavor of flavors) {
      if (flavor["__EMPTY_11"] === "ORDENAR") {
        flavorsToReorder.push(flavor["__EMPTY"]);
        gallonsRemaining.push(flavor["__EMPTY_5"]);
      }
    }

    if (!flavorsToReorder.length) return;

    flavorsMessage = flavorsToReorder.join("\n");
    const finalGals = gallonsRemaining.map((q) => q.toString() + " gallons");
    gallonsMessage = finalGals.join("\n");

    try {
      await app.client.chat.postMessage({
        channel: "C04GSTQ463A",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: " ⚠️ *Warning!* ⚠️\n  Our inventory is running low for the following items:",
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*SKU(s):*\n${flavorsMessage}`,
              },
              {
                type: "mrkdwn",
                text: `*Remaining Quantity:*\n${gallonsMessage}`,
              },
            ],
          },
        ],
      });

      console.log(result);
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
