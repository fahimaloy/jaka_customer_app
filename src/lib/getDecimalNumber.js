export default function getDecimalNumber(number, numbersAfterDecimal = 2) {
  if (!number && number != 0) {
    return null;
  } else if (typeof number == "number") {
    return number.toFixed(numbersAfterDecimal);
  } else {
    let numberString = number;
    try {
      numberString = number.toString();
    } catch (e) {
      numberString = number;
    }

    // Find the position of the decimal point
    const decimalIndex = numberString.indexOf(".");

    // If there's no decimal point, return 0
    if (decimalIndex === -1) {
      return numberString;
    }

    // Return the number of characters after the decimal point
    const digitsAfterDecimal = numberString.length - decimalIndex - 1;
    if (digitsAfterDecimal > numbersAfterDecimal)
      return parseFloat(numberString).toFixed(numbersAfterDecimal);
    else return numberString;
  }
}
