/**
 * SharePoint credentials
 */

const siteUrl =
  "https://looseleaf420.sharepoint.com/sites/LooseLeafDominicanaGlobalHub";

const siteContext = {
  siteUrl,
  creds: {
    username: process.env.MICROSOFT_USERNAME,
    password: process.env.MICROSOFT_PASSWORD,
    online: true,
  },
};

const spPullOpts = {
  spRootFolder: "Inventory",
  dlRootFolder: "./downloaded-inventory",
};

module.export = {
  siteContext,
  siteUrl,
  spPullOpts,
};
