import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/auth.service';

export type CurrencyCode = 'USD' | 'EUR' | 'MXN' | 'HNL' | 'COP' | 'ARS' | 'BRL';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'HNL', symbol: 'L', name: 'Lempira Hondureño', locale: 'es-HN' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', locale: 'es-MX' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', locale: 'es-CO' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', locale: 'es-AR' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño', locale: 'pt-BR' },
];

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrencyByCode: (code: CurrencyCode) => Promise<void>;
  formatCurrency: (amount: number) => string;
  refreshFromBackend: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const ASYNC_STORAGE_KEY = '@walletly_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyInfo>(SUPPORTED_CURRENCIES[0]); // Default USD

  useEffect(() => {
    // Initial load from local storage for instant UI
    loadLocalCurrency();
    // Then sync with backend
    refreshFromBackend();
  }, []);

  const loadLocalCurrency = async () => {
    try {
      const savedCode = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
      if (savedCode) {
        const found = SUPPORTED_CURRENCIES.find(c => c.code === savedCode);
        if (found) setCurrency(found);
      }
    } catch (error) {
      console.error('Error loading local currency:', error);
    }
  };

  const refreshFromBackend = async () => {
    try {
      const profile = await AuthService.getProfile();
      if (profile && profile.currency) {
        const found = SUPPORTED_CURRENCIES.find(c => c.code === profile.currency);
        if (found) {
          setCurrency(found);
          // Sync local storage
          await AsyncStorage.setItem(ASYNC_STORAGE_KEY, profile.currency);
        }
      }
    } catch (error) {
      // User might not be logged in yet, or offline
      console.log('Backend currency sync skipped (not logged in or offline)');
    }
  };

  const setCurrencyByCode = async (code: CurrencyCode) => {
    const found = SUPPORTED_CURRENCIES.find(c => c.code === code);
    if (found) {
      // 1. Update UI immediately
      setCurrency(found);
      
      try {
        // 2. Persist locally (cache)
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, code);
        
        // 3. Sync with backend
        await AuthService.updateProfile({ currency: code });
      } catch (error) {
        console.error('Error syncing currency with backend:', error);
        // We still keep the local change for UX, it will try to sync next time
      }
    }
  };

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    
    // Using toLocaleString for region-specific decimal/thousand separators
    const formatted = absAmount.toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Handle symbol placement based on code
    if (currency.code === 'HNL') {
      return `${isNegative ? '-' : ''}L ${formatted}`;
    }
    if (currency.code === 'EUR') {
      return `${isNegative ? '-' : ''}${formatted} €`;
    }
    if (currency.code === 'BRL') {
      return `${isNegative ? '-' : ''}R$ ${formatted}`;
    }
    
    return `${isNegative ? '-' : ''}${currency.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyByCode, formatCurrency, refreshFromBackend }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
