import pkg from "xlsx";
const { readFile, utils } = pkg;

export async function calculateBoxesInventory() {
  const boxesWorkbook = await readFile(
    "./downloaded-inventory/Inventory/Cajas de Empaque.xlsm"
  );
  const boxesWorksheet = boxesWorkbook.Sheets["Inventory"];
  const boxesData = utils.sheet_to_json(boxesWorksheet);

  const productList = boxesData.slice(1);
  console.log(productList);

  const boxesToReorder = [];
  const quantityRemaining = [];

  let boxesMessage, boxesQuantityMessage;

  for (const product of productList) {
    if (product["__EMPTY_12"] === "REORDER") {
      boxesToReorder.push(product["__EMPTY"]);
      quantityRemaining.push(product["__EMPTY_4"]);
    }
  }

  if (!boxesToReorder.length) return;

  boxesMessage = boxesToReorder.join("\n");
  const finalBoxes = quantityRemaining.map((q) => q.toString() + " boxes");
  boxesQuantityMessage = finalBoxes.join("\n");

  return { boxesMessage, boxesQuantityMessage };
}
