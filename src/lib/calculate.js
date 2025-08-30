const calculatePriceAndTax = (sellingPrice, taxPercent = 0, isTaxInclusive) => {
  let basePrice = 0;
  let taxAmount = 0;
  console.log(sellingPrice, taxPercent, isTaxInclusive);
  if (isTaxInclusive) {
    basePrice = sellingPrice / (1 + taxPercent / 100);
    taxAmount = sellingPrice - basePrice;
  } else {
    basePrice = sellingPrice;
    taxAmount = sellingPrice * (taxPercent / 100);
  }
  console.log(basePrice, taxAmount);
  return {
    basePrice: parseFloat(basePrice),
    taxAmount: parseFloat(taxAmount),
  };
};

export const formatDecimalToEighth = (decimal) => {
  if (!decimal && decimal != 0 && decimal != "0") return decimal;
  else if (typeof decimal == "string")
    return parseFloat(parseFloat(decimal).toFixed(8));
  else if (typeof decimal == "number") return parseFloat(decimal.toFixed(8));
};

export default calculatePriceAndTax;
