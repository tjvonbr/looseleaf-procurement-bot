const asana = require("asana");
const { flavorMap } = require("./lib/asana");
const { SPPull } = require("sppull");
const { readFile, utils } = require("xlsx");

// const accessToken = process.env.ASANA_ACCESS_TOKEN;
const client = asana.Client.create().useAccessToken(
  process.env.ASANA_ACCESS_TOKEN
);

const siteUrl =
  "https://looseleaf420.sharepoint.com/sites/LooseLeafDominicanaGlobalHub";

const context = {
  siteUrl,
  creds: {
    username: "trevor@looseleafinternational.com",
    password: "OhioState2021!",
    online: true,
  },
};

const options = {
  spRootFolder: "Inventory",
  dlRootFolder: "./downloaded-inventory",
};

async function updateAsanaFlavors() {
  // Go through each row in each table
  await SPPull.download(context, options)
    .then(() => {
      console.log("Updated files are downloaded for the Asana task");
    })
    .catch((err) => {
      console.log("Core error has happened", err);
    });

  // Find the current inventory
  const flavorsWorkbook = await readFile("./downloaded-inventory/Flavors.xlsm");

  const flavorsWorksheet = flavorsWorkbook.Sheets["Inventory"];
  const incomingWorksheet = flavorsWorkbook.Sheets["Incoming"];
  const flavorsData = utils.sheet_to_json(flavorsWorksheet);
  const incomingData = utils.sheet_to_json(incomingWorksheet);

  const flavors = flavorsData.slice(1);
  const incomingShipments = incomingData.slice(1);

  for (const flavor of flavors) {
    // Update inventory
    try {
      const task = await client.tasks.getTask(flavorMap[flavor["__EMPTY"]]);

      if (!task) {
        console.log("Error!  There is no task associated with this flavor!");
      }

      let inProduction = null;
      let inTransit = null;
      let rawDeliveryDate = null;
      let deliveryDate = null;
      let deliveryQuantity = null;

      if (flavor["__EMPTY_8"]) {
        inTransit = flavor["__EMPTY_8"];
      }

      if (flavor["__EMPTY_9"]) {
        inProduction = flavor["__EMPTY_9"];
      }

      const upcomingDeliveryCount = inProduction + inTransit;

      const lastDelivery = incomingShipments.find(
        (shipment) => shipment["__EMPTY"] === flavor["__EMPTY"]
      );

      if (lastDelivery) {
        rawDeliveryDate = lastDelivery["__EMPTY_1"];
        deliveryDate = new Date(rawDeliveryDate);
        deliveryQuantity = lastDelivery["__EMPTY_2"];
      }

      await client.tasks.updateTask(task.gid, {
        custom_fields: {
          1203666911576780: flavor["__EMPTY_4"], // Current inventory
          1203610619264139: deliveryDate ? { date: deliveryDate } : null,
          1203777942659669: deliveryQuantity, // Last delivery quantity
          1203618807073883: upcomingDeliveryCount
            ? upcomingDeliveryCount
            : null,
        },
      });
    } catch (err) {
      console.log(
        `Error!  Something went wrong updating the flavors inventory -- ${flavor["__EMPTY"]}\n${err}`
      );
    }
  }
}

updateAsanaFlavors();

async function updateAsanaBags() {}

module.exports = { updateAsanaBags, updateAsanaFlavors };
