const { readFile, utils } = "xlsx";

async function calculateBoxesInventory() {
  const boxesWorkbook = await readFile(
    "./downloaded-inventory/Cajas de Empaque.xlsm"
  );
  const boxesWorksheet = boxesWorkbook.Sheets["Inventory"];
  const boxesData = utils.sheet_to_json(boxesWorksheet);

  const productList = boxesData.slice(1);

  const boxesToReorder = [];
  const quantityRemaining = [];

  let boxesQuantityMessage;

  for (const product of productList) {
    if (
      product["__EMPTY_12"] === "REORDER" &&
      product["__EMPTY_3"] !== 0 && // Initial order must not be 0...
      product["__EMPTY_4"] !== 0 // ...and incoming cannot be 0
    ) {
      boxesToReorder.push(product["__EMPTY"]);
      quantityRemaining.push(product["__EMPTY_4"]);
    }
  }

  if (!boxesToReorder.length) return;

  const finalBoxes = quantityRemaining.map(
    (q) => q.toLocaleString() + " boxes"
  );
  boxesQuantityMessage = finalBoxes.join("\n");

  return { boxesToReorder, boxesQuantityMessage };
}

module.exports = { calculateBoxesInventory };
