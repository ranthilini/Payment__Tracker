import { useState, useMemo } from 'react';
import type { PaymentRecord } from '../types';
import RecordRow from './RecordRow';

interface Props {
  records: PaymentRecord[];
}

type SortKey = 'month' | 'scheduled' | 'paid' | 'outstanding' | 'status';
type FilterStatus = 'All' | PaymentRecord['status'];
type FilterTier = 'All' | '1-30' | '31-60' | '61-90' | '91-120';

export default function PaymentTable({ records }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('month');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All');
  const [filterTier, setFilterTier] = useState<FilterTier>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  const filtered = useMemo(() => {
    let list = [...records];
    if (filterStatus !== 'All') list = list.filter((r) => r.status === filterStatus);
    if (filterTier !== 'All') {
      const [lo, hi] = filterTier.split('-').map(Number);
      list = list.filter((r) => r.month >= lo && r.month <= hi);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.month.toString().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      switch (sortKey) {
        case 'month': aVal = a.month; bVal = b.month; break;
        case 'scheduled': aVal = a.scheduledAmount; bVal = b.scheduledAmount; break;
        case 'paid': aVal = a.actualPaid; bVal = b.actualPaid; break;
        case 'outstanding':
          aVal = Math.max(0, a.scheduledAmount - a.actualPaid - a.totalDeducted);
          bVal = Math.max(0, b.scheduledAmount - b.actualPaid - b.totalDeducted);
          break;
        case 'status': aVal = a.status; bVal = b.status; break;
        default: aVal = a.month; bVal = b.month;
      }
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [records, filterStatus, filterTier, search, sortKey, sortAsc]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon active">{sortAsc ? '↑' : '↓'}</span>;
  }

  return (
    <div className="table-wrapper">
      {/* Filters */}
      <div className="table-filters">
        <input
          className="filter-search"
          type="text"
          placeholder="Search month, status, notes…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          id="filter-search"
        />
        <select
          className="filter-select"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as FilterStatus); setPage(1); }}
          id="filter-status"
        >
          {(['All', 'Pending', 'Partial', 'Paid', 'Overdue', 'Waived'] as FilterStatus[]).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filterTier}
          onChange={(e) => { setFilterTier(e.target.value as FilterTier); setPage(1); }}
          id="filter-tier"
        >
          {(['All', '1-30', '31-60', '61-90', '91-120'] as FilterTier[]).map((t) => (
            <option key={t} value={t}>{t === 'All' ? 'All Tiers' : `Months ${t}`}</option>
          ))}
        </select>
        <span className="filter-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="table-scroll">
        <table className="records-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('month')} className="sortable">Month <SortIcon k="month" /></th>
              <th>Tier</th>
              <th onClick={() => handleSort('scheduled')} className="sortable">Scheduled <SortIcon k="scheduled" /></th>

              <th onClick={() => handleSort('paid')} className="sortable">Actual Paid <SortIcon k="paid" /></th>
              <th onClick={() => handleSort('outstanding')} className="sortable">Outstanding <SortIcon k="outstanding" /></th>
              <th>Last Payment</th>
              <th onClick={() => handleSort('status')} className="sortable">Status <SortIcon k="status" /></th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-row">No records match your filters.</td>
              </tr>
            ) : (
              paged.map((r) => <RecordRow key={r.id} record={r} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
