import { useMemo } from 'react';
import { useApp } from './context/AppContext';
import { computeSummary } from './utils/helpers';
import Toolbar from './components/Toolbar';
import SummaryPanel from './components/SummaryPanel';
import PaymentTable from './components/PaymentTable';

export default function App() {
  const { state } = useApp();
  const summary = useMemo(
    () => computeSummary(state.records, state.settings.totalAdvanceBudget),
    [state.records, state.settings.totalAdvanceBudget]
  );

  return (
    <div className="app-shell">
      <Toolbar />
      <main className="app-main">
        <div className="app-controls">
          <div className="agreement-badge">
            📅 Agreement: 120 months · 4 tiers · Rs. 260,000 advance pool
          </div>
        </div>
        <SummaryPanel summary={summary} />
        <section className="table-section">
          <h2 className="section-title">Monthly Payment Records</h2>
          <p className="section-hint">
            Click any row to expand transactions. Use ✏️ to edit scheduled amount, advance config,
            status &amp; notes. Use ↺ to reset a month's data.
          </p>
          <PaymentTable records={state.records} />
        </section>
      </main>
    </div>
  );
}
