/**
 * Form validation and focus management utilities
 */

export interface FocusFirstErrorFieldParams {
  addressValid: boolean;
  cardValid: boolean;
  addressErrors: Record<string, string | undefined>;
  cardErrors: Record<string, any>;
  setFocus: (fieldName: any) => void; // More generic to work with React Hook Form
  toast: {
    error: (message: string) => void;
  };
}

/**
 * Focuses on the first field with validation errors
 * Handles both address form and card form with proper timing and fallbacks
 */
export const focusFirstErrorField = async ({
  addressValid,
  cardValid,
  addressErrors,
  cardErrors,
  setFocus,
  toast,
}: FocusFirstErrorFieldParams): Promise<void> => {
  console.log('🎯 Focus function called:', { addressValid, cardValid });
  
  // Wait for React to complete all state updates
  await new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 200); // Longer delay to ensure all updates complete
    });
  });
  
  if (!addressValid) {
    console.log('🔍 Looking for address errors:', addressErrors);
    
    // Focus on first address field with error
    const addressFieldOrder = ['firstName', 'lastName', 'email', 'phone', 'country', 'address', 'city', 'state', 'zipCode'];
    
    for (const fieldName of addressFieldOrder) {
      const hasError = addressErrors[fieldName];
      console.log(`📋 Field ${fieldName}: hasError=${!!hasError}`);
      
      if (hasError) {
        // Try multiple strategies to find and focus the field
        const strategies = [
          () => document.querySelector(`[data-address-field="${fieldName}"]`),
          () => document.querySelector(`input[data-address-field="${fieldName}"]`),
          () => document.querySelector(`select[data-address-field="${fieldName}"]`), 
          () => document.querySelector(`button[data-address-field="${fieldName}"]`),
          () => document.querySelector(`[data-radix-collection-item][data-value]`), // For Combobox
        ];
        
        let fieldElement: HTMLElement | null = null;
        for (const strategy of strategies) {
          try {
            fieldElement = strategy() as HTMLElement;
            if (fieldElement && fieldElement.offsetParent !== null) { // Ensure element is visible
              break;
            }
          } catch (e) {
            // Continue to next strategy
          }
        }
        
        if (fieldElement) {
          console.log(`✅ Found field element for ${fieldName}:`, fieldElement);
          
          // Force focus with multiple attempts
          const focusElement = () => {
            fieldElement.focus();
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Double-check focus was successful
            setTimeout(() => {
              if (document.activeElement !== fieldElement) {
                console.log('🔄 Retrying focus...');
                fieldElement.focus();
              }
            }, 100);
          };
          
          focusElement();
          toast.error("Please fill in all required address fields correctly.");
          return;
        } else {
          console.log(`❌ Could not find element for field: ${fieldName}`);
        }
      }
    }
    
    // Fallback toast if no field was focused
    toast.error("Please fill in all required address fields correctly.");
    
  } else if (!cardValid) {
    console.log('🔍 Looking for card errors:', cardErrors);
    
    // Focus on first card field with error
    const cardFieldOrder = ['cardNumber', 'expiryDate', 'cvc'] as const;
    
    for (const fieldName of cardFieldOrder) {
      if (cardErrors[fieldName]) {
        console.log(`✅ Focusing card field: ${fieldName}`);
        
        // Use React Hook Form's setFocus
        setFocus(fieldName);
        
        // Also manually find and scroll to the element
        setTimeout(() => {
          const fieldElement = document.querySelector(`input[name="${fieldName}"]`) as HTMLElement;
          if (fieldElement) {
            fieldElement.focus();
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log(`✅ Scrolled to card field: ${fieldName}`);
          }
        }, 100);
        
        toast.error("Please fill in all required payment details correctly.");
        return;
      }
    }
    
    toast.error("Please fill in all required payment details correctly.");
  }
};

/**
 * Focuses on a specific field by data attribute with fallback strategies
 */
export const focusFieldByDataAttribute = (
  fieldName: string,
  dataAttribute: string = 'data-address-field'
): void => {
  setTimeout(() => {
    const strategies = [
      () => document.querySelector(`[${dataAttribute}="${fieldName}"]`),
      () => document.querySelector(`input[${dataAttribute}="${fieldName}"]`),
      () => document.querySelector(`select[${dataAttribute}="${fieldName}"]`),
      () => document.querySelector(`button[${dataAttribute}="${fieldName}"]`),
    ];
    
    let fieldElement: HTMLElement | null = null;
    for (const strategy of strategies) {
      try {
        fieldElement = strategy() as HTMLElement;
        if (fieldElement && fieldElement.offsetParent !== null) {
          break;
        }
      } catch (e) {
        // Continue to next strategy
      }
    }
    
    if (fieldElement) {
      fieldElement.focus();
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 200);
};

/**
 * Common validation error messages
 */
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  cardNumber: 'Please enter a valid card number',
  expiryDate: 'Please enter a valid expiry date',
  cvc: 'Please enter a valid CVC code',
  zipCode: 'Please enter a valid zip/postal code',
} as const; 