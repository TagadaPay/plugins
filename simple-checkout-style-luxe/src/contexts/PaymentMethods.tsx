'use client';

import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  RefObject,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';

export type PaymentInformation = {
  isValid: boolean;
  type: string | null;
  informations: Record<string, any> | null;
};

export type WhopEmbedControls = {
  whopRef: RefObject<any> | null;
};

const PaymentMethodsContext = createContext<PaymentInformation>({
  isValid: false,
  type: null,
  informations: null,
});

const SetPaymentMethodsContext = createContext<Dispatch<SetStateAction<PaymentInformation>>>(() => {
  /* noop */
});

export const PaymentMethodsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentInformation>({
    isValid: false,
    type: null,
    informations: null,
  });

  const value = useMemo(
    () => ({
      paymentMethods,
      setPaymentMethods,
    }),
    [paymentMethods, setPaymentMethods],
  );

  return (
    <PaymentMethodsContext.Provider value={value.paymentMethods}>
      <SetPaymentMethodsContext.Provider value={value.setPaymentMethods}>
        {children}
      </SetPaymentMethodsContext.Provider>
    </PaymentMethodsContext.Provider>
  );
};

export const usePaymentMethod = () => useContext(PaymentMethodsContext);
export const useSetPaymentMethod = () => useContext(SetPaymentMethodsContext);
