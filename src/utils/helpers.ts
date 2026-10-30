import type { PaymentRecord, Summary } from '../types';

export function getScheduledAmount(month: number): number {
  if (month >= 1 && month <= 30) return 390000;
  if (month >= 31 && month <= 60) return 455000;
  if (month >= 61 && month <= 90) return 786500;
  if (month >= 91 && month <= 120) return 865150;
  return 0;
}

export function computeRecordStatus(record: PaymentRecord): PaymentRecord['status'] {
  const net = record.scheduledAmount - record.totalDeducted;
  if (record.actualPaid === 0 && record.totalDeducted === 0) return 'Pending';
  if (record.actualPaid >= net && net > 0) return 'Paid';
  if (record.actualPaid >= record.scheduledAmount) return 'Paid';
  if (record.actualPaid > 0 || record.totalDeducted > 0) return 'Partial';
  return 'Pending';
}

export function computeSummary(records: PaymentRecord[], totalAdvanceBudget: number): Summary {
  let totalScheduled = 0;
  let totalActualPaid = 0;
  let totalAdvanceDeducted = 0;
  let totalOutstanding = 0;
  let paidCount = 0;
  let partialCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  for (const r of records) {
    totalScheduled += r.scheduledAmount;
    totalActualPaid += r.actualPaid;
    totalAdvanceDeducted += r.totalDeducted;

    const outstanding = Math.max(0, r.scheduledAmount - r.actualPaid - r.totalDeducted);
    totalOutstanding += outstanding;

    switch (r.status) {
      case 'Paid': paidCount++; break;
      case 'Partial': partialCount++; break;
      case 'Pending': pendingCount++; break;
      case 'Overdue': overdueCount++; break;
    }
  }

  return {
    totalScheduled,
    totalActualPaid,
    totalAdvanceDeducted,
    remainingAdvanceBudget: Math.max(0, totalAdvanceBudget - totalAdvanceDeducted),
    totalOutstanding,
    paidCount,
    partialCount,
    pendingCount,
    overdueCount,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('PKR', 'Rs.');
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// CSV Export
export function exportCSV(records: PaymentRecord[]): void {
  const headers = [
    'Month',
    'Scheduled Amount',
    'Advance Deduction Config',
    'Total Advance Deducted',
    'Actual Paid',
    'Outstanding',
    'Payment Date',
    'Status',
    'Notes',
    'Transaction Count',
  ];

  const rows = records.map((r) => {
    const outstanding = Math.max(0, r.scheduledAmount - r.actualPaid - r.totalDeducted);
    return [
      r.month,
      r.scheduledAmount,
      r.advanceDeductionConfig,
      r.totalDeducted,
      r.actualPaid,
      outstanding,
      r.paymentDate ?? '',
      r.status,
      `"${r.notes.replace(/"/g, '""')}"`,
      r.transactions.length,
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payment_records_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
