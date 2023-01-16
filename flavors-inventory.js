import pkg from "xlsx";
const { readFile, utils } = pkg;

export async function calculateFlavorsInventory() {
  const flavorsWorkbook = await readFile("./downloaded-inventory/Flavors.xlsm");

  const flavorsWorksheet = flavorsWorkbook.Sheets["Inventory"];
  const flavorsData = utils.sheet_to_json(flavorsWorksheet);

  const productList = flavorsData.slice(1);

  const flavorsToReorder = [];
  const quantityRemaining = [];

  let flavorsMessage, flavorsQuantityRemaining;

  for (const product of productList) {
    if (product["__EMPTY_10"] === "ORDENAR") {
      flavorsToReorder.push(product["__EMPTY"]);
      quantityRemaining.push(product["__EMPTY_4"]);
    }
  }

  if (!flavorsToReorder.length) return;

  flavorsMessage = flavorsToReorder.join("\n");
  const finalFlavors = quantityRemaining.map(
    (q) => q.toString() + " containers"
  );
  flavorsQuantityRemaining = finalFlavors.join("\n");

  return { flavorsToReorder, flavorsMessage, flavorsQuantityRemaining };
}
