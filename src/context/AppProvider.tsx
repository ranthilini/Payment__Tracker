import { useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AppContext } from './AppContext';
import type { AppState, PaymentRecord, Transaction, AppSettings } from '../types';
import { loadState, saveState } from '../utils/storage';
import { getScheduledAmount, generateId, computeRecordStatus } from '../utils/helpers';

// ── Seed initial 120 records (no fictitious payments) ──────────────────────
function createInitialState(): AppState {
  const now = new Date().toISOString();
  const records: PaymentRecord[] = Array.from({ length: 120 }, (_, i) => {
    const month = i + 1;
    return {
      id: generateId(),
      month,
      scheduledAmount: getScheduledAmount(month),
      advanceDeductionConfig: 0,
      actualPaid: 0,
      totalDeducted: 0,
      paymentDate: null,
      status: 'Pending',
      notes: '',
      transactions: [],
      createdAt: now,
      updatedAt: now,
    };
  });

  return {
    records,
    settings: {
      agreementStartDate: new Date().toISOString().split('T')[0],
      totalAdvanceBudget: 260000,
      currencySymbol: 'Rs.',
    },
    lastSaved: null,
  };
}

// ── Reducer ────────────────────────────────────────────────────────────────
type Action =
  | { type: 'UPDATE_RECORD'; payload: PaymentRecord }
  | { type: 'DELETE_RECORD'; id: string }
  | { type: 'RESET_RECORD'; id: string }
  | { type: 'ADD_TRANSACTION'; recordId: string; tx: Transaction }
  | { type: 'UPDATE_TRANSACTION'; recordId: string; tx: Transaction }
  | { type: 'DELETE_TRANSACTION'; recordId: string; txId: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESTORE_STATE'; payload: AppState }
  | { type: 'RESET_ALL' };

function recalcRecord(r: PaymentRecord): PaymentRecord {
  const actualPaid = r.transactions.reduce((s, t) => s + t.amount, 0);
  const totalDeducted = r.transactions.reduce((s, t) => s + t.deduction, 0);
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const paymentDate = r.transactions.length > 0 ? localDate : null;
  const updated: PaymentRecord = { ...r, actualPaid, totalDeducted, paymentDate };
  return { ...updated, status: computeRecordStatus(updated), updatedAt: new Date().toISOString() };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPDATE_RECORD': {
      const records = state.records.map((r) =>
        r.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : r
      );
      return { ...state, records };
    }
    case 'DELETE_RECORD': {
      // Re-create the record as blank rather than removing it from the list
      const existing = state.records.find((r) => r.id === action.id);
      if (!existing) return state;
      const blank: PaymentRecord = {
        ...existing,
        actualPaid: 0,
        totalDeducted: 0,
        paymentDate: null,
        status: 'Pending',
        notes: '',
        transactions: [],
        updatedAt: new Date().toISOString(),
      };
      return { ...state, records: state.records.map((r) => (r.id === action.id ? blank : r)) };
    }
    case 'RESET_RECORD': {
      const existing = state.records.find((r) => r.id === action.id);
      if (!existing) return state;
      const blank: PaymentRecord = {
        ...existing,
        actualPaid: 0,
        totalDeducted: 0,
        advanceDeductionConfig: 0,
        paymentDate: null,
        status: 'Pending',
        notes: '',
        transactions: [],
        updatedAt: new Date().toISOString(),
      };
      return { ...state, records: state.records.map((r) => (r.id === action.id ? blank : r)) };
    }
    case 'ADD_TRANSACTION': {
      const records = state.records.map((r) => {
        if (r.id !== action.recordId) return r;
        return recalcRecord({ ...r, transactions: [...r.transactions, action.tx] });
      });
      return { ...state, records };
    }
    case 'UPDATE_TRANSACTION': {
      const records = state.records.map((r) => {
        if (r.id !== action.recordId) return r;
        return recalcRecord({
          ...r,
          transactions: r.transactions.map((t) => (t.id === action.tx.id ? action.tx : t)),
        });
      });
      return { ...state, records };
    }
    case 'DELETE_TRANSACTION': {
      const records = state.records.map((r) => {
        if (r.id !== action.recordId) return r;
        return recalcRecord({
          ...r,
          transactions: r.transactions.filter((t) => t.id !== action.txId),
        });
      });
      return { ...state, records };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'RESTORE_STATE':
      return action.payload;
    case 'RESET_ALL':
      return createInitialState();
    default:
      return state;
  }
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    return loadState() ?? createInitialState();
  });

  // Auto-save on every state change
  useEffect(() => {
    saveState({ ...state, lastSaved: new Date().toISOString() });
  }, [state]);

  const updateRecord = useCallback((r: PaymentRecord) => dispatch({ type: 'UPDATE_RECORD', payload: r }), []);
  const deleteRecord = useCallback((id: string) => dispatch({ type: 'DELETE_RECORD', id }), []);
  const resetRecord = useCallback((id: string) => dispatch({ type: 'RESET_RECORD', id }), []);

  const addTransaction = useCallback(
    (recordId: string, tx: Omit<Transaction, 'id' | 'createdAt'>) =>
      dispatch({
        type: 'ADD_TRANSACTION',
        recordId,
        tx: { ...tx, id: generateId(), createdAt: new Date().toISOString() },
      }),
    []
  );

  const updateTransaction = useCallback(
    (recordId: string, tx: Transaction) => dispatch({ type: 'UPDATE_TRANSACTION', recordId, tx }),
    []
  );

  const deleteTransaction = useCallback(
    (recordId: string, txId: string) => dispatch({ type: 'DELETE_TRANSACTION', recordId, txId }),
    []
  );

  const updateSettings = useCallback(
    (s: Partial<AppSettings>) => dispatch({ type: 'UPDATE_SETTINGS', payload: s }),
    []
  );

  const restoreState = useCallback(
    (s: AppState) => dispatch({ type: 'RESTORE_STATE', payload: s }),
    []
  );

  const resetAll = useCallback(() => dispatch({ type: 'RESET_ALL' }), []);

  return (
    <AppContext.Provider
      value={{
        state,
        updateRecord,
        deleteRecord,
        resetRecord,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateSettings,
        restoreState,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
