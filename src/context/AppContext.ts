import { createContext, useContext } from 'react';
import type { AppState, PaymentRecord, Transaction, AppSettings } from '../types';

export interface AppContextValue {
  state: AppState;
  updateRecord: (updated: PaymentRecord) => void;
  deleteRecord: (id: string) => void;
  resetRecord: (id: string) => void;
  addTransaction: (recordId: string, tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (recordId: string, tx: Transaction) => void;
  deleteTransaction: (recordId: string, txId: string) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  restoreState: (s: AppState) => void;
  resetAll: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
