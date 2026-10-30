import React, { useState } from 'react';
import type { Transaction } from '../types';

interface Props {
  initialTx: Transaction | null;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function TransactionModal({ initialTx, onSave, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialTx?.date ?? today);
  const [amount, setAmount] = useState(initialTx?.amount.toString() ?? '');
  const [deduction, setDeduction] = useState(initialTx?.deduction.toString() ?? '0');
  const [notes, setNotes] = useState(initialTx?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!date) e.date = 'Date is required';
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) e.amount = 'Enter a valid amount (≥ 0)';
    const ded = parseFloat(deduction);
    if (isNaN(ded) || ded < 0) e.deduction = 'Enter a valid deduction (≥ 0)';
    if (amt === 0 && ded === 0) e.amount = 'At least one of amount or deduction must be > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      date,
      amount: parseFloat(amount) || 0,
      deduction: parseFloat(deduction) || 0,
      notes,
    });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>{initialTx ? 'Edit Transaction' : 'Add Payment Transaction'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="tx-date">Payment Date *</label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={errors.date ? 'input-error' : ''}
            />
            {errors.date && <span className="error-msg">{errors.date}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tx-amount">Amount Paid (Rs.)</label>
              <input
                id="tx-amount"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={errors.amount ? 'input-error' : ''}
              />
              {errors.amount && <span className="error-msg">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="tx-deduction">Advance Deduction (Rs.)</label>
              <input
                id="tx-deduction"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={deduction}
                onChange={(e) => setDeduction(e.target.value)}
                className={errors.deduction ? 'input-error' : ''}
              />
              {errors.deduction && <span className="error-msg">{errors.deduction}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tx-notes">Notes</label>
            <textarea
              id="tx-notes"
              rows={2}
              placeholder="Optional notes about this payment…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {initialTx ? 'Update' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
