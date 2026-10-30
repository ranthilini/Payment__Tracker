// ─── Payment Tracking System – Types ───────────────────────────────────────

export type PaymentStatus =
  | 'Pending'
  | 'Partial'
  | 'Paid'
  | 'Overdue'
  | 'Waived';

// A single partial payment transaction recorded against a month
export interface Transaction {
  id: string;
  date: string;          // ISO date string  YYYY-MM-DD
  amount: number;        // Amount actually paid
  deduction: number;     // Advance deduction applied in this transaction
  notes: string;
  createdAt: string;     // ISO timestamp
}

// One monthly record (120 total)
export interface PaymentRecord {
  id: string;
  month: number;                    // 1–120
  scheduledAmount: number;          // Per-agreement scheduled payment
  advanceDeductionConfig: number;   // Configured advance deduction for this month (default 0, editable)
  actualPaid: number;               // Sum of transaction amounts (auto-calculated)
  totalDeducted: number;            // Sum of transaction deductions (auto-calculated)
  paymentDate: string | null;       // Date of last payment (or null)
  status: PaymentStatus;
  notes: string;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

// Application-level settings / state
export interface AppSettings {
  agreementStartDate: string;   // YYYY-MM-DD
  totalAdvanceBudget: number;   // Rs. 260,000 total advance
  currencySymbol: string;
}

export interface AppState {
  records: PaymentRecord[];
  settings: AppSettings;
  lastSaved: string | null;
}

// Summary statistics derived from records
export interface Summary {
  totalScheduled: number;
  totalActualPaid: number;
  totalAdvanceDeducted: number;
  remainingAdvanceBudget: number;
  totalOutstanding: number;
  paidCount: number;
  partialCount: number;
  pendingCount: number;
  overdueCount: number;
}
