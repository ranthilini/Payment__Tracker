import { useState } from 'react';
import type { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';
import TransactionModal from './TransactionModal';

interface Props {
  recordId: string;
  transactions: Transaction[];
  onAdd: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onUpdate: (tx: Transaction) => void;
  onDelete: (txId: string) => void;
}

export default function TransactionList({ transactions, onAdd, onUpdate, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  function handleSave(tx: Omit<Transaction, 'id' | 'createdAt'>) {
    if (editing) {
      onUpdate({ ...editing, ...tx });
    } else {
      onAdd(tx);
    }
    setEditing(null);
    setShowModal(false);
  }

  return (
    <div className="transaction-list">
      <div className="tx-header">
        <h4>Transaction History</h4>
        <button className="btn btn-sm btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          + Add Payment
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="tx-empty">No transactions recorded yet.</p>
      ) : (
        <table className="tx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount Paid</th>
              <th>Advance Deduction</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.date)}</td>
                  <td className="amount-cell">{formatCurrency(tx.amount)}</td>
                  <td className="deduction-cell">
                    {tx.deduction > 0 ? formatCurrency(tx.deduction) : '—'}
                  </td>
                  <td className="notes-cell">{tx.notes || '—'}</td>
                  <td className="actions-cell">
                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => { setEditing(tx); setShowModal(true); }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-xs btn-danger"
                      onClick={() => {
                        if (window.confirm('Delete this transaction?')) onDelete(tx.id);
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <TransactionModal
          initialTx={editing}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
