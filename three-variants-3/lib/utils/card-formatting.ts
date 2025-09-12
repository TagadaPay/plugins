export function formatCardNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");

  // Add spaces every 4 digits
  const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");

  // Limit to 19 characters (16 digits + 3 spaces)
  return formatted.slice(0, 19);
}

export function formatExpiryDate(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, "");

  // Add slash after 2 digits
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }

  return digits;
}
