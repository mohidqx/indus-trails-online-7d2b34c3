import { createContext, useContext, useState, ReactNode } from 'react';

export type CurrencyCode = 'PKR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  convert: (pkrAmount: number) => number;
  format: (pkrAmount: number) => string;
  symbol: string;
}

const rates: Record<CurrencyCode, number> = {
  PKR: 1,
  USD: 0.0036,
  EUR: 0.0033,
  GBP: 0.0028,
};

const symbols: Record<CurrencyCode, string> = {
  PKR: 'PKR',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'PKR',
  setCurrency: () => {},
  convert: (v) => v,
  format: (v) => `PKR ${v.toLocaleString()}`,
  symbol: 'PKR',
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('PKR');

  const convert = (pkrAmount: number) => {
    const converted = pkrAmount * rates[currency];
    return currency === 'PKR' ? Math.round(converted) : Math.round(converted * 100) / 100;
  };

  const format = (pkrAmount: number) => {
    const val = convert(pkrAmount);
    if (currency === 'PKR') return `PKR ${val.toLocaleString()}`;
    return `${symbols[currency]}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, format, symbol: symbols[currency] }}>
      {children}
    </CurrencyContext.Provider>
  );
}
