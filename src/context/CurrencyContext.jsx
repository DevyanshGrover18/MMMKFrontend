import { createContext, useContext, useEffect, useState } from 'react';
import {
  BASE_CURRENCY,
  DEFAULT_RATES,
  SUPPORTED_CURRENCIES,
  normalizeCurrency,
} from '../utils/currency';

const CurrencyContext = createContext(null);

const STORAGE_KEY = 'selectedCurrency';
const EXCHANGE_RATE_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    if (typeof window === 'undefined') return BASE_CURRENCY;

    return normalizeCurrency(window.localStorage.getItem(STORAGE_KEY));
  });
  const [rates, setRates] = useState(DEFAULT_RATES);

  useEffect(() => {
    let isMounted = true;

    const fetchRates = async () => {
      try {
        const response = await fetch(EXCHANGE_RATE_URL);
        const data = await response.json();

        if (!isMounted || !data?.rates) return;

        const nextRates = SUPPORTED_CURRENCIES.reduce((acc, code) => {
          acc[code] = Number(data.rates?.[code] || DEFAULT_RATES[code] || 1);
          return acc;
        }, {});

        setRates({
          ...DEFAULT_RATES,
          ...nextRates,
          USD: 1,
        });
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      }
    };

    fetchRates();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const setCurrency = (nextCurrency) => {
    setCurrencyState(normalizeCurrency(nextCurrency));
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

const useCurrency = () => {
  return useContext(CurrencyContext);
};

export { CurrencyProvider, useCurrency };
