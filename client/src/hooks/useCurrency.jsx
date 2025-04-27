import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available currencies
export const currencies = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 1, // Base rate
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rate: 0.8, // Approximate conversion rate (1 USD = 0.8 GBP)
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 0.92, // Approximate conversion rate (1 USD = 0.92 EUR)
  },
};

// Create context
const CurrencyContext = createContext();

// Currency provider component
export function CurrencyProvider({ children }) {
  // Default to GBP for UK users, otherwise USD
  const [activeCurrency, setActiveCurrency] = useState(() => {
    // Try to get from localStorage first
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && currencies[savedCurrency]) {
      return currencies[savedCurrency];
    }
    
    // Otherwise detect based on timezone/locale
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // If in UK timezone, default to GBP
      if (timeZone.includes('London') || 
          timeZone.includes('Europe/London') || 
          navigator.language.includes('en-GB')) {
        return currencies.GBP;
      }
    } catch (e) {
      console.error('Error detecting locale:', e);
    }
    
    // Default to USD
    return currencies.USD;
  });

  // Format price based on active currency
  const formatPrice = (priceInUSD) => {
    if (!priceInUSD && priceInUSD !== 0) return '';
    
    const convertedPrice = priceInUSD * activeCurrency.rate;
    return `${activeCurrency.symbol}${convertedPrice.toFixed(2)}`;
  };

  // Convert price to selected currency without formatting
  const convertPrice = (priceInUSD) => {
    if (!priceInUSD && priceInUSD !== 0) return 0;
    return priceInUSD * activeCurrency.rate;
  };

  // Handle currency change
  const changeCurrency = (currencyCode) => {
    if (currencies[currencyCode]) {
      setActiveCurrency(currencies[currencyCode]);
      localStorage.setItem('preferredCurrency', currencyCode);
    }
  };

  // Value object to provide to consumers
  const value = {
    activeCurrency,
    currencies,
    formatPrice,
    convertPrice,
    changeCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

// Hook for using the currency context
export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}