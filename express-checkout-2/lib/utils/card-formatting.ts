/**
 * Card formatting utilities for payment forms
 */

/**
 * Formats card number with spaces every 4 digits
 * @param value - Raw card number input
 * @returns Formatted card number (e.g., "1234 5678 9012 3456")
 */
export const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s/g, "").replace(/\D/g, "");
    return v.replace(/(\d{4})(?=\d)/g, "$1 ");
};

/**
 * Formats expiry date as MM/YY
 * @param value - Raw expiry date input
 * @returns Formatted expiry date (e.g., "12/25")
 */
export const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
        return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
};

/**
 * Validates card number using Luhn algorithm
 * @param cardNumber - Card number to validate (with or without spaces)
 * @returns Boolean indicating if card number is valid
 */
export const validateCardNumber = (cardNumber: string): boolean => {
    const number = cardNumber.replace(/\s/g, "");

    if (!/^\d+$/.test(number) || number.length < 13 || number.length > 19) {
        return false;
    }

    // Luhn algorithm
    let sum = 0;
    let shouldDouble = false;

    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i), 10);

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
};

/**
 * Validates expiry date
 * @param expiryDate - Expiry date in MM/YY format
 * @returns Boolean indicating if expiry date is valid and not expired
 */
export const validateExpiryDate = (expiryDate: string): boolean => {
    const cleaned = expiryDate.replace(/\D/g, "");

    if (cleaned.length !== 4) {
        return false;
    }

    const month = parseInt(cleaned.substring(0, 2), 10);
    const year = parseInt("20" + cleaned.substring(2, 4), 10);

    if (month < 1 || month > 12) {
        return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }

    return true;
};

/**
 * Validates CVC code
 * @param cvc - CVC code
 * @returns Boolean indicating if CVC is valid (3-4 digits)
 */
export const validateCVC = (cvc: string): boolean => {
    const cleaned = cvc.replace(/\D/g, "");
    return cleaned.length >= 3 && cleaned.length <= 4;
};
