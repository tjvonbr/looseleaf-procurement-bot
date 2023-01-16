import app from "./app.js";
import * as cron from "node-cron";
import { calculateBagsInventory } from "./bags-inventory.js";
import { calculateBoxesInventory } from "./boxes-inventory.js";
import { calculateFlavorsInventory } from "./flavors-inventory.js";
import asana from "asana";

const accessToken = process.env.ASANA_ACCESS_TOKEN;
const client = asana.Client.create().useAccessToken(accessToken);

const projectGid = "1203590834169226";
const trevorsUserGid = process.env.ASANA_USER_GID;

async function createAsanaProcurementTask() {
  await client.tasks.createTask({
    projects: [projectGid],
    name: "Test Task from Trevor",
    // To find the enum value gids, use Asana's API explorer
    // https://developers.asana.com/explorer
    custom_fields: {
      1203611032261860: trevorsUserGid, // Assignee
      1203571693339765: "1203571693339766", // Task Status
      1203571888323022: "1203591692296514", // Payment Status
    },
  });

  return;
}

cron.schedule("*/30 * * * * *", async () => {
  // */30 * * * * *
  // 0 9 * * 5
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
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*How would you like to proceed with this information?*",
          },
        },
        {
          type: "actions",
          block_id: "actionblock1",
          elements: [
            {
              action_id: "create_task",
              type: "button",
              text: {
                type: "plain_text",
                text: "Create Asana task",
              },
              style: "primary",
              value: "click_me_456",
            },
            {
              action_id: "ignore_alert",
              type: "button",
              text: {
                type: "plain_text",
                text: "Ignore",
              },
              style: "danger",
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

// --> Slack app listeners <--
app.action("create_task", async ({ ack, body }) => {
  await ack();

  const result = await createAsanaProcurementTask();

  const responseBlocks = [...body.message.blocks];

  const acknowledgementBlock = {
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Status:*\nAsana task created ✅`,
      },
      {
        type: "mrkdwn",
        text: `*User:*\n<@${body.user.id}>`,
      },
    ],
  };

  responseBlocks.splice(-2);
  responseBlocks.push(acknowledgementBlock);

  await app.client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    as_user: true,
    blocks: responseBlocks,
  });
});

app.action("ignore_alert", async ({ ack, body }) => {
  await ack();

  const responseBlocks = [...body.message.blocks];

  const acknowledgementBlock = {
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Status:*\nAlert acknowledged but no Asana task created ❌`,
      },
      {
        type: "mrkdwn",
        text: `*User:*\n<@${body.user.id}>`,
      },
    ],
  };

  responseBlocks.splice(-2);
  responseBlocks.push(acknowledgementBlock);

  await app.client.chat.update({
    channel: body.channel.id,
    ts: body.message.ts,
    as_user: true,
    blocks: responseBlocks,
  });
});
