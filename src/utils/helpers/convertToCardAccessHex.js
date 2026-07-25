// utils/helpers/convertToCardAccessHex.js

const convertCardNumberToHex = (cardNumber) => {
  const num = parseInt(cardNumber);
  const bytes = [];
  for (let i = 3; i >= 0; i--) {
    bytes.push(((num >> (i * 8)) & 0xff).toString(16).padStart(2, "0"));
  }
  return bytes.join("");
};
const convertAccessToHex = (cardAccess, accessLevelNumber) => {
  const levelNum = parseInt(accessLevelNumber) & 0x7f;
  const accessByte = (cardAccess ? 0x80 : 0x00) | levelNum;
  return accessByte.toString(16).padStart(2, "0");
};

export const convertToCardAccessHex = (
  cardNumber,
  cardAccess,
  accessLevelNumber,
) => {
  try {
    const cardHex = convertCardNumberToHex(cardNumber);
    const accessHex = convertAccessToHex(cardAccess, accessLevelNumber);
    return (cardHex + accessHex).toUpperCase();
  } catch (error) {
    console.error("Error converting to hex:", error);
    return "0000000000";
  }
};

// const convertCardNumberToHex = (cardNumber) => {
//   // Ensure the card number is treated as a 32-bit integer
//   const num = parseInt(cardNumber) & 0xffffffff; // Mask to 32 bits
//   const bytes = [];
//   for (let i = 3; i >= 0; i--) {
//     bytes.push(((num >> (i * 8)) & 0xff).toString(16).padStart(2, "0"));
//   }
//   return bytes.join("");
// };

// const convertAccessToHex = (cardAccess, accessLevelNumber) => {
//   const levelNum = parseInt(accessLevelNumber) & 0x7f;
//   const accessByte = (cardAccess ? 0x80 : 0x00) | levelNum;
//   return accessByte.toString(16).padStart(2, "0");
// };

// export const convertToCardAccessHex = (
//   cardNumber,
//   cardAccess,
//   accessLevelNumber,
// ) => {
//   try {
//     const cardHex = convertCardNumberToHex(cardNumber);
//     const accessHex = convertAccessToHex(cardAccess, accessLevelNumber);
//     return (cardHex + accessHex).toUpperCase();
//   } catch (error) {
//     console.error("Error converting to hex:", error);
//     return "0000000000";
//   }
// };
