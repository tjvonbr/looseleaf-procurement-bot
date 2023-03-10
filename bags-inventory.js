const { readFile, utils } = "xlsx";

async function calculateBagsInventory() {
  const bagsWorkbook = await readFile(
    "./downloaded-inventory/Bolsas de Empaque.xlsm"
  );
  const bagsWorksheet = bagsWorkbook.Sheets["Inventory"];
  const bagsData = utils.sheet_to_json(bagsWorksheet);

  const productList = bagsData.slice(1);

  const bagsToReorder = [];
  const quantityRemaining = [];

  let bagsQuantityMessage;

  for (const product of productList) {
    if (
      product["__EMPTY_12"] === "ORDENAR" &&
      product["__EMPTY_3"] && // Initial order must not be 0...
      product["__EMPTY_4"] // ...and incoming cannot be 0
    ) {
      bagsToReorder.push(product["__EMPTY"]);
      quantityRemaining.push(product["__EMPTY_4"]);
    }
  }

  if (!bagsToReorder.length) return;

  const finalBags = quantityRemaining.map((q) => q.toLocaleString() + " bags");
  bagsQuantityMessage = finalBags.join("\n");

  return { bagsToReorder, bagsQuantityMessage };
}

module.exports = { calculateBagsInventory };
