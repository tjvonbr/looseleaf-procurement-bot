import pkg from "xlsx";
const { readFile, utils } = pkg;

export async function calculateBagsInventory() {
  const bagsWorkbook = await readFile(
    "./downloaded-inventory/Inventory/Bolsas de Empaque.xlsm"
  );
  const bagsWorksheet = bagsWorkbook.Sheets["Inventory"];
  const bagsData = utils.sheet_to_json(bagsWorksheet);

  const productList = bagsData.slice(1);

  const bagsToReorder = [];
  const quantityRemaining = [];

  let bagsMessage, bagsQuantityMessage;

  for (const product of productList) {
    if (product["__EMPTY_12"] === "ORDENAR") {
      bagsToReorder.push(product["__EMPTY"]);
      quantityRemaining.push(product["__EMPTY_4"]);
    }
  }

  if (!bagsToReorder.length) return;

  bagsMessage = bagsToReorder.join("\n");
  const finalBags = quantityRemaining.map((q) => q.toString() + " bags");
  bagsQuantityMessage = finalBags.join("\n");

  return { bagsMessage, bagsQuantityMessage };
}
