import React from 'react';
import type { Summary } from '../types';
import { formatCurrency } from '../utils/helpers';

interface Props {
  summary: Summary;
}

const cards = (s: Summary) => [
  {
    label: 'Total Scheduled',
    value: formatCurrency(s.totalScheduled),
    color: 'var(--accent-blue)',
    icon: '📋',
  },
  {
    label: 'Total Actual Paid',
    value: formatCurrency(s.totalActualPaid),
    color: 'var(--accent-green)',
    icon: '✅',
  },
  // {
  //   label: 'Total Advance Deducted',
  //   value: formatCurrency(s.totalAdvanceDeducted),
  //   color: 'var(--accent-orange)',
  //   icon: '🔄',
  // },
  // {
  //   label: 'Remaining Advance',
  //   value: formatCurrency(s.remainingAdvanceBudget),
  //   color: 'var(--accent-purple)',
  //   icon: '💼',
  // },
  {
    label: 'Total Outstanding',
    value: formatCurrency(s.totalOutstanding),
    color: s.totalOutstanding > 0 ? 'var(--accent-red)' : 'var(--accent-green)',
    icon: '⚖️',
  },
];

const statusBadges = (s: Summary) => [
  { label: 'Paid', count: s.paidCount, color: 'var(--badge-paid)' },
  { label: 'Partial', count: s.partialCount, color: 'var(--badge-partial)' },
  { label: 'Pending', count: s.pendingCount, color: 'var(--badge-pending)' },
  { label: 'Overdue', count: s.overdueCount, color: 'var(--badge-overdue)' },
];

export default function SummaryPanel({ summary }: Props) {
  return (
    <div className="summary-panel">
      <div className="summary-cards">
        {cards(summary).map((c) => (
          <div key={c.label} className="summary-card" style={{ '--card-accent': c.color } as React.CSSProperties}>
            <span className="summary-card-icon">{c.icon}</span>
            <div>
              <div className="summary-card-label">{c.label}</div>
              <div className="summary-card-value">{c.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="summary-status-row">
        {statusBadges(summary).map((b) => (
          <span key={b.label} className="status-badge-count" style={{ '--badge-color': b.color } as React.CSSProperties}>
            <strong>{b.count}</strong> {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
