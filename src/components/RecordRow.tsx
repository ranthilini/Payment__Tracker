import { useState } from 'react';
import type { PaymentRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useApp } from '../context/AppContext';
import TransactionList from './TransactionList';
import RecordEditModal from './RecordEditModal';

interface Props {
  record: PaymentRecord;
}

function StatusPill({ status }: { status: PaymentRecord['status'] }) {
  return <span className={`status-pill status-${status.toLowerCase()}`}>{status}</span>;
}

export default function RecordRow({ record }: Props) {
  const { addTransaction, updateTransaction, deleteTransaction, resetRecord } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const outstanding = Math.max(0, record.scheduledAmount - record.actualPaid - record.totalDeducted);

  return (
    <>
      <tr
        className={`record-row ${expanded ? 'record-row--expanded' : ''} status-row-${record.status.toLowerCase()}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="month-cell">
          <span className="month-badge">M{record.month}</span>
        </td>
        <td className="tier-cell">{getTier(record.month)}</td>
        <td className="amount-cell">{formatCurrency(record.scheduledAmount)}</td>

        <td className="amount-cell">{record.actualPaid > 0 ? formatCurrency(record.actualPaid) : '—'}</td>
        <td className={`amount-cell ${outstanding > 0 ? 'outstanding' : 'settled'}`}>
          {outstanding > 0 ? formatCurrency(outstanding) : '✓'}
        </td>
        <td>{formatDate(record.paymentDate)}</td>
        <td>
          <StatusPill status={record.status} />
        </td>
        <td className="notes-cell">{record.notes || '—'}</td>
        <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-xs btn-ghost"
            title="Edit record"
            onClick={() => setEditing(true)}
          >
            ✏️
          </button>
          <button
            className="btn btn-xs btn-danger"
            title="Reset record"
            onClick={() => {
              if (window.confirm(`Reset all data for Month ${record.month}?`)) {
                resetRecord(record.id);
              }
            }}
          >
            ↺
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="expand-row">
          <td colSpan={9}>
            <div className="expand-content">
              <TransactionList
                recordId={record.id}
                transactions={record.transactions}
                onAdd={(tx) => addTransaction(record.id, tx)}
                onUpdate={(tx) => updateTransaction(record.id, tx)}
                onDelete={(txId) => deleteTransaction(record.id, txId)}
              />
            </div>
          </td>
        </tr>
      )}

      {editing && (
        <RecordEditModal record={record} onClose={() => setEditing(false)} />
      )}
    </>
  );
}

function getTier(month: number): string {
  if (month <= 30) return 'Tier 1 (1–30)';
  if (month <= 60) return 'Tier 2 (31–60)';
  if (month <= 90) return 'Tier 3 (61–90)';
  return 'Tier 4 (91–120)';
}
