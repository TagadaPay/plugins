interface FocusErrorFieldParams {
  addressValid: boolean;
  cardValid: boolean;
  addressErrors: Record<string, string | undefined>;
  cardErrors: Record<string, any>;
  setFocus: (name: string) => void;
  toast: (message: string, type?: "success" | "error" | "loading") => void;
}

export async function focusFirstErrorField({
  addressValid,
  cardValid,
  addressErrors,
  cardErrors,
  setFocus,
  toast,
}: FocusErrorFieldParams) {
  // Check address errors first
  if (!addressValid) {
    const firstAddressError = Object.entries(addressErrors).find(
      ([, error]) => error
    );
    if (firstAddressError) {
      const [fieldName] = firstAddressError;
      focusFieldByDataAttribute(fieldName);
      toast(`Please fix the ${fieldName} field`, "error");
      return;
    }
  }

  // Check card errors
  if (!cardValid) {
    const firstCardError = Object.entries(cardErrors).find(
      ([, error]) => error
    );
    if (firstCardError) {
      const [fieldName] = firstCardError;
      focusFieldByDataAttribute(fieldName);
      toast(`Please fix the ${fieldName} field`, "error");
      return;
    }
  }

  // Generic error if no specific field found
  toast("Please fix the errors in the form", "error");
}

export function focusFieldByDataAttribute(fieldName: string) {
  const field =
    document.querySelector(`[data-address-field="${fieldName}"]`) ||
    document.querySelector(`[data-card-field="${fieldName}"]`);

  if (field instanceof HTMLElement) {
    field.focus();
    field.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
