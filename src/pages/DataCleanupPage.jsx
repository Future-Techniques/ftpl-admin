import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Trash2,
  Search,
  RefreshCw,
  CheckSquare,
  Square,
  Eye,
  X,
  Filter,
  Sparkles,
  Database,
  Layers,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Calendar
} from 'lucide-react';

const PRESET_KEYWORDS = [
  'test',
  'demo',
  'sample',
  'temp',
  'dummy',
  'asdf',
  'applicant_test',
  'sub_test'
];

export function DataCleanupPage() {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [searchQuery, setSearchQuery] = useState('test');
  const [selectedTable, setSelectedTable] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);

  // Multi-selection state: Set of "tableName:id" strings
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Inspect details modal
  const [inspectingRecord, setInspectingRecord] = useState(null);

  // Deletion in progress & confirmation modal
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  // Fetch summary counts
  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await api.get('/admin/cleanup/summary');
      if (res.data.result === 'success') {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Failed to load cleanup summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Search records
  const fetchRecords = async (query = searchQuery, table = selectedTable, sDate = startDate, eDate = endDate) => {
    try {
      setLoadingRecords(true);
      const params = {
        q: query,
        table: table,
        limit: 100
      };
      if (sDate) params.startDate = sDate;
      if (eDate) params.endDate = eDate;

      const res = await api.get('/admin/cleanup/search', { params });
      if (res.data.result === 'success') {
        setRecords(res.data.records || []);
        setTotalMatches(res.data.totalMatches || 0);
        setSelectedItems(new Set());
      }
    } catch (err) {
      console.error('Failed to fetch search records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchRecords('test', 'all', '', '');
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchRecords(searchQuery, selectedTable, startDate, endDate);
  };

  const handlePresetClick = (keyword) => {
    setSearchQuery(keyword);
    fetchRecords(keyword, selectedTable, startDate, endDate);
  };

  const handleTableChange = (tbl) => {
    setSelectedTable(tbl);
    fetchRecords(searchQuery, tbl, startDate, endDate);
  };

  const setDateFilterQuick = (type) => {
    const now = new Date();
    let s = '';
    let e = '';

    if (type === 'today') {
      s = now.toISOString().split('T')[0];
      e = now.toISOString().split('T')[0];
    } else if (type === '7days') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      s = past.toISOString().split('T')[0];
      e = now.toISOString().split('T')[0];
    } else if (type === '30days') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      s = past.toISOString().split('T')[0];
      e = now.toISOString().split('T')[0];
    } else if (type === 'all') {
      s = '';
      e = '';
    }

    setStartDate(s);
    setEndDate(e);
    fetchRecords(searchQuery, selectedTable, s, e);
  };

  const getItemKey = (rec) => `${rec.tableName}:${rec.id}`;

  const toggleSelect = (rec) => {
    const key = getItemKey(rec);
    const updated = new Set(selectedItems);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    setSelectedItems(updated);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === records.length) {
      setSelectedItems(new Set());
    } else {
      const allKeys = new Set(records.map(getItemKey));
      setSelectedItems(allKeys);
    }
  };

  const isAllSelected = records.length > 0 && selectedItems.size === records.length;

  const handleExecuteDelete = async () => {
    if (selectedItems.size === 0) return;

    try {
      setIsDeleting(true);
      const itemsPayload = Array.from(selectedItems).map((key) => {
        const [table, id] = key.split(':');
        return { table, id };
      });

      const res = await api.post('/admin/cleanup/delete', { items: itemsPayload });
      if (res.data.result === 'success') {
        setDeleteSuccessMsg(res.data.message || `Deleted ${res.data.totalDeleted} record(s)`);
        setShowConfirmModal(false);
        setInspectingRecord(null);
        setSelectedItems(new Set());
        await fetchSummary();
        await fetchRecords(searchQuery, selectedTable, startDate, endDate);
      }
    } catch (err) {
      setDeleteErrorMsg(err.response?.data?.message || err.message || 'Failed to delete records');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSingleDelete = (rec) => {
    setSelectedItems(new Set([getItemKey(rec)]));
    setShowConfirmModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#574B66]/10 border border-[#574B66]/20 text-[#574B66] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#D6969D]" />
              <span>Data Management Tool</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382E42] tracking-tight">
              Data Cleanup & Test Record Manager
            </h1>
            <p className="text-slate-500 text-sm max-w-2xl font-medium">
              Search across all database collections by keyword or creation date range to inspect, isolate, and safely bulk-delete test submissions and spam.
            </p>
          </div>

          {/* Quick Summary Pill Box */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE] text-center min-w-[110px]">
              <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-bold">Total in DB</span>
              <span className="text-xl font-extrabold text-[#574B66] font-mono">
                {loadingSummary ? '...' : summary?.totalRecords || 0}
              </span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE] text-center min-w-[110px]">
              <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-bold">Matches Found</span>
              <span className="text-xl font-extrabold text-[#C47983] font-mono">
                {loadingRecords ? '...' : totalMatches}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {deleteSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-sm shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{deleteSuccessMsg}</span>
          </div>
          <button
            onClick={() => setDeleteSuccessMsg('')}
            className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification Alert */}
      {deleteErrorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-sm shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{deleteErrorMsg}</span>
          </div>
          <button
            onClick={() => setDeleteErrorMsg('')}
            className="p-1 rounded-lg hover:bg-rose-100 text-rose-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E2EE] space-y-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Main Keyword Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search test keywords (e.g. 'test', 'demo', 'sample', 'applicant_test')..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E2EE] rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
              />
            </div>

            {/* Collection Filter Dropdown */}
            <div className="sm:w-64">
              <select
                value={selectedTable}
                onChange={(e) => handleTableChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#E8E2EE] rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition font-medium"
              >
                <option value="all">All Collections (Global)</option>
                {summary &&
                  Object.values(summary.summary).map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label} ({item.count})
                    </option>
                  ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loadingRecords}
              className="px-6 py-3 bg-[#574B66] hover:bg-[#463B53] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
            >
              {loadingRecords ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search</span>
            </button>
          </div>

          {/* Date Filter Bar */}
          <div className="p-3 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[#574B66] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#D6969D]" /> Date Range:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-[#E8E2EE] rounded-lg text-slate-800 text-xs focus:outline-none focus:border-[#574B66]"
                  title="Created After / On"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-[#E8E2EE] rounded-lg text-slate-800 text-xs focus:outline-none focus:border-[#574B66]"
                  title="Created Before / On"
                />
                <button
                  type="button"
                  onClick={() => fetchRecords(searchQuery, selectedTable, startDate, endDate)}
                  className="px-3 py-1.5 bg-[#574B66] hover:bg-[#463B53] text-white font-semibold rounded-lg text-xs transition"
                >
                  Filter Date
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDateFilterQuick('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  !startDate && !endDate
                    ? 'bg-[#574B66] text-white font-bold'
                    : 'bg-white text-slate-600 border border-[#E8E2EE] hover:text-[#574B66]'
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => setDateFilterQuick('today')}
                className="px-2.5 py-1 rounded-lg bg-white text-slate-600 border border-[#E8E2EE] hover:text-[#574B66] font-medium transition"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDateFilterQuick('7days')}
                className="px-2.5 py-1 rounded-lg bg-white text-slate-600 border border-[#E8E2EE] hover:text-[#574B66] font-medium transition"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setDateFilterQuick('30days')}
                className="px-2.5 py-1 rounded-lg bg-white text-slate-600 border border-[#E8E2EE] hover:text-[#574B66] font-medium transition"
              >
                Last 30 Days
              </button>
            </div>
          </div>
        </form>

        {/* Preset Search Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E8E2EE]">
          <span className="text-xs font-semibold text-[#574B66] mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#D6969D]" /> Quick Keywords:
          </span>
          {PRESET_KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => handlePresetClick(kw)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                searchQuery.toLowerCase() === kw.toLowerCase()
                  ? 'bg-[#574B66] text-white border-[#574B66] font-bold shadow-sm'
                  : 'bg-[#F8F6FA] text-slate-700 border-[#E8E2EE] hover:bg-[#F0ECF4] hover:text-[#574B66]'
              }`}
            >
              "{kw}"
            </button>
          ))}
          <button
            type="button"
            onClick={() => handlePresetClick('')}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-[#F8F6FA] text-slate-600 border border-[#E8E2EE] hover:bg-[#F0ECF4] hover:text-[#574B66] transition"
          >
            View All Recent
          </button>
        </div>
      </div>

      {/* Floating Batch Action Toolbar */}
      {selectedItems.size > 0 && (
        <div className="sticky top-20 z-20 p-4 rounded-xl bg-[#382E42] text-slate-900 shadow-xl flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C47983] flex items-center justify-center font-bold text-white text-sm">
              {selectedItems.size}
            </div>
            <span className="text-sm font-bold">
              {selectedItems.size} record{selectedItems.size > 1 ? 's' : ''} selected for deletion
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedItems(new Set())}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-slate-900 transition"
            >
              Deselect All
            </button>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-[#C47983] hover:bg-[#A85A65] text-slate-900 text-xs font-bold rounded-lg flex items-center gap-2 shadow-md transition active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedItems.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-2xl bg-white border border-[#E8E2EE] overflow-hidden shadow-sm">
        {/* Table Header Controls */}
        <div className="p-4 bg-[#F8F6FA] border-b border-[#E8E2EE] flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              disabled={records.length === 0}
              className="p-1 rounded text-slate-500 hover:text-[#574B66] transition disabled:opacity-30"
              title="Select all matches"
            >
              {isAllSelected ? (
                <CheckSquare className="w-5 h-5 text-[#574B66]" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </button>
            <span className="text-slate-700">
              Showing {records.length} matching result{records.length !== 1 ? 's' : ''}
            </span>
          </div>

          <button
            onClick={() => fetchRecords(searchQuery, selectedTable, startDate, endDate)}
            className="flex items-center gap-1.5 text-[#574B66] hover:text-[#463B53] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRecords ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table Body */}
        {loadingRecords ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#574B66]" />
            <p className="text-sm font-medium">Scanning collections in database...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#382E42]">No Matching Test Records Found</h3>
            <p className="text-slate-500 text-xs max-w-sm">
              Your database appears clean for the current filter. Try another keyword or change the date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E8E2EE] bg-[#F8F6FA]/70 text-[11px] font-bold uppercase tracking-wider text-[#574B66]">
                  <th className="py-3.5 pl-4 pr-2 w-12 text-center">#</th>
                  <th className="py-3.5 px-3">Collection</th>
                  <th className="py-3.5 px-3">Record Details</th>
                  <th className="py-3.5 px-3">Created Date</th>
                  <th className="py-3.5 px-3 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((rec) => {
                  const key = getItemKey(rec);
                  const isChecked = selectedItems.has(key);

                  return (
                    <tr
                      key={key}
                      className={`hover:bg-[#FAF8FB] transition group ${
                        isChecked ? 'bg-[#FAF0F2]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 pl-4 pr-2 text-center">
                        <button
                          onClick={() => toggleSelect(rec)}
                          className="p-1 rounded text-slate-400 hover:text-[#574B66] transition"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#574B66]" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Collection Badge */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#574B66]/10 text-[#574B66] border border-[#574B66]/20">
                          <Layers className="w-3 h-3 text-[#574B66]" />
                          <span>{rec.tableLabel}</span>
                        </span>
                      </td>

                      {/* Title & Subtext */}
                      <td className="py-3.5 px-3 max-w-md">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 truncate group-hover:text-[#574B66] transition">
                            {rec.primaryText}
                          </span>
                          {rec.secondaryText && (
                            <span className="text-xs text-slate-500 truncate">
                              {rec.secondaryText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                        {rec.created_at
                          ? new Date(rec.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectingRecord(rec)}
                            className="p-1.5 rounded-lg bg-[#F8F6FA] text-slate-600 hover:text-[#574B66] hover:bg-[#F0ECF4] border border-[#E8E2EE] transition shadow-sm"
                            title="Inspect full record details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSingleDelete(rec)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:text-rose-700 hover:bg-rose-100 border border-rose-200 transition shadow-sm"
                            title="Delete this record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Record Modal */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-[#E8E2EE] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#E8E2EE] bg-[#F8F6FA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#574B66]/10 border border-[#574B66]/20 text-[#574B66]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#382E42] text-base">
                    Record Inspection: {inspectingRecord.tableLabel}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: #{inspectingRecord.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#574B66] hover:bg-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE] space-y-2.5">
                {Object.entries(inspectingRecord.rawDetails || {}).map(([k, v]) => (
                  <div key={k} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2 border-b border-gray-200/60 last:border-0 last:pb-0">
                    <span className="font-bold text-[#574B66] shrink-0">{k}:</span>
                    <span className="text-slate-700 break-all text-right font-sans text-xs">
                      {v === null || v === undefined
                        ? <em className="text-slate-400">null</em>
                        : typeof v === 'object'
                        ? JSON.stringify(v)
                        : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#E8E2EE] bg-[#F8F6FA] flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectingRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#574B66] transition"
              >
                Close
              </button>
              <button
                onClick={() => handleSingleDelete(inspectingRecord)}
                className="px-4 py-2 bg-[#C47983] hover:bg-[#A85A65] text-slate-900 text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete This Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Safety Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-[#382E42]">Confirm Permanent Deletion</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are about to permanently delete{' '}
                <strong className="text-rose-600">{selectedItems.size} selected record(s)</strong>{' '}
                from your database. This action cannot be undone.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE] text-xs text-[#574B66] font-mono text-center">
              Target Selection: {selectedItems.size} items across selected collections
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E2EE] text-xs font-semibold text-slate-700 hover:bg-[#F8F6FA] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[#C47983] hover:bg-[#A85A65] text-slate-900 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
