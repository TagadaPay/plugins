const PHONE_DIGITS_REGEX = /^\+?\d{7,15}$/;

export const regexPhone = {
  test(value: string): boolean {
    const stripped = value.replace(/[\s\-().]/g, '');
    return PHONE_DIGITS_REGEX.test(stripped);
  }
};
