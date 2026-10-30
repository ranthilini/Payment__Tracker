import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { importJSON } from '../utils/storage';
import { exportCSV } from '../utils/helpers';

export default function Toolbar() {
  const { state, restoreState, resetAll } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  function flash(text: string, type: 'success' | 'error') {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importJSON(file);
      if (!imported.records || !imported.settings) throw new Error('Invalid backup file structure');
      restoreState(imported);
      flash('Backup restored successfully!', 'success');
    } catch (err) {
      flash(`Import failed: ${(err as Error).message}`, 'error');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h1 className="app-title">
          <span className="title-icon"></span>
          Payment Tracker
        </h1>
        <span className="app-subtitle">10-Year Agreement</span>
      </div>
      <div className="toolbar-right">
        {msg && (
          <span className={`toolbar-msg toolbar-msg--${msg.type}`}>{msg.text}</span>
        )}
        <button
          id="btn-export-csv"
          className="btn btn-secondary"
          onClick={() => { exportCSV(state.records); flash('CSV exported', 'success'); }}
          title="Export all records as CSV"
        >
          📊 Export CSV
        </button>
        {/* <button
          id="btn-export-json"
          className="btn btn-secondary"
          onClick={() => { exportJSON(state); flash('JSON backup downloaded', 'success'); }}
          title="Download full backup as JSON"
        >
          💾 Backup JSON
        </button> */}
        <label className="btn btn-secondary" title="Restore from JSON backup">
          📂 Restore
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
            id="input-restore-json"
          />
        </label>
        <button
          id="btn-reset-all"
          className="btn btn-danger-outline"
          onClick={() => {
            if (window.confirm('Reset ALL data to the initial 120 blank records? This cannot be undone.')) {
              resetAll();
              flash('All data reset to defaults', 'success');
            }
          }}
          title="Reset all data"
        >
          ↺ Reset All
        </button>
      </div>
    </div>
  );
}
