import React, { useState } from 'react';
import type { PaymentRecord } from '../types';
import { formatCurrency, getScheduledAmount } from '../utils/helpers';
import { useApp } from '../context/AppContext';

interface Props {
  record: PaymentRecord;
  onClose: () => void;
}

const STATUS_OPTIONS: PaymentRecord['status'][] = ['Pending', 'Partial', 'Paid', 'Overdue', 'Waived'];

export default function RecordEditModal({ record, onClose }: Props) {
  const { updateRecord } = useApp();
  const [scheduledAmount, setScheduledAmount] = useState(record.scheduledAmount.toString());
  const [advanceDeductionConfig, setAdvanceDeductionConfig] = useState(
    record.advanceDeductionConfig.toString()
  );
  const [status, setStatus] = useState<PaymentRecord['status']>(record.status);
  const [notes, setNotes] = useState(record.notes);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const defaultScheduled = getScheduledAmount(record.month);

  function validate() {
    const e: Record<string, string> = {};
    const sa = parseFloat(scheduledAmount);
    if (isNaN(sa) || sa < 0) e.scheduledAmount = 'Enter a valid amount';
    const adc = parseFloat(advanceDeductionConfig);
    if (isNaN(adc) || adc < 0) e.advanceDeductionConfig = 'Enter a valid deduction';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    updateRecord({
      ...record,
      scheduledAmount: parseFloat(scheduledAmount),
      advanceDeductionConfig: parseFloat(advanceDeductionConfig),
      status,
      notes,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>Edit Month {record.month} Record</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="re-scheduled">
                Scheduled Amount (Rs.)
                <span className="form-hint">
                  Agreement default: {formatCurrency(defaultScheduled)}
                </span>
              </label>
              <input
                id="re-scheduled"
                type="number"
                min="0"
                step="1"
                value={scheduledAmount}
                onChange={(e) => setScheduledAmount(e.target.value)}
                className={errors.scheduledAmount ? 'input-error' : ''}
              />
              {errors.scheduledAmount && <span className="error-msg">{errors.scheduledAmount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="re-advance">
                Advance Deduction Config (Rs.)
                <span className="form-hint">Planned deduction for this month</span>
              </label>
              <input
                id="re-advance"
                type="number"
                min="0"
                step="1"
                value={advanceDeductionConfig}
                onChange={(e) => setAdvanceDeductionConfig(e.target.value)}
                className={errors.advanceDeductionConfig ? 'input-error' : ''}
              />
              {errors.advanceDeductionConfig && (
                <span className="error-msg">{errors.advanceDeductionConfig}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="re-status">Override Status</label>
            <select
              id="re-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentRecord['status'])}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="re-notes">Notes</label>
            <textarea
              id="re-notes"
              rows={3}
              placeholder="Any notes for this month…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setScheduledAmount(defaultScheduled.toString());
              }}
            >
              Reset to Agreement
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
