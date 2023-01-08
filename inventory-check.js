import app from "./app.js";
import * as cron from "node-cron";
import { calculateBagsInventory } from "./bags-inventory.js";
import { calculateBoxesInventory } from "./boxes-inventory.js";
import { calculateFlavorsInventory } from "./flavors-inventory.js";

cron.schedule("0 9 * * 5", async () => {
  try {
    const { bagsMessage, bagsQuantityMessage } = await calculateBagsInventory();
    const { boxesMessage, boxesQuantityMessage } =
      await calculateBoxesInventory();
    const { flavorsMessage, flavorsQuantityRemaining } =
      await calculateFlavorsInventory();

    await app.client.chat.postMessage({
      text: "There are low-stock products in our inventory.  Check out the LooseLeaf Dominicana inventory documents in OneDrive.",
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
              text: `*Flavors:*\n${flavorsMessage}`,
            },
            {
              type: "mrkdwn",
              text: `*Remaining Quantity:*\n${flavorsQuantityRemaining}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Boxes:*\n${boxesMessage}`,
            },
            {
              type: "mrkdwn",
              text: `*Remaining Quantity:*\n${boxesQuantityMessage}`,
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Bags:*\n${bagsMessage}`,
            },
            {
              type: "mrkdwn",
              text: `*Remaining Quantity:*\n${bagsQuantityMessage}`,
            },
          ],
        },
      ],
    });
  } catch (err) {
    app.client.chat.postMessage({
      text: "Error!  Something is wrong with the LooseLeaf Procurement Bot.",
      channel: "C04GSTQ463A",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: " 🚨 *Error!* 🚨\n  Something is wrong with the LooseLeaf Procurement Bot.",
          },
        },
      ],
    });
  }
});
