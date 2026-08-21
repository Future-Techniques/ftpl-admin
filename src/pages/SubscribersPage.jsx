import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  MailCheck,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Download,
  Calendar,
  Mail
} from 'lucide-react';

export function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;

      const res = await api.get('/admin/subscribers', { params });
      if (res.data.result === 'success') {
        setSubscribers(res.data.subscribers);
      }
    } catch (err) {
      showToast('error', 'Failed to load newsletter subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const res = await api.get('/admin/subscribers/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ftpl_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('success', 'Subscriber email list exported as CSV');
    } catch (err) {
      showToast('error', 'Failed to export subscriber list');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!subscriberToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/subscribers/${subscriberToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Subscriber removed successfully');
        setDeleteModalOpen(false);
        setSubscriberToDelete(null);
        fetchSubscribers();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to remove subscriber');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#382E42] tracking-tight flex items-center gap-2.5">
            <MailCheck className="w-7 h-7 text-[#574B66]" />
            <span>Newsletter Subscribers</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage subscriber email list from website footer and export CSV for marketing campaigns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={exporting || subscribers.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95 shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export CSV List'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E2EE] flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSubscribers()}
            placeholder="Search subscribers by email address..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
          />
        </div>

        <button
          onClick={fetchSubscribers}
          className="p-2.5 text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] rounded-xl transition border border-[#E8E2EE]"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Subscribers Data Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
              <tr>
                <th className="px-5 py-3.5">Email Address</th>
                <th className="px-4 py-3.5">Subscribed Date</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#574B66] mb-3" />
                    <p className="text-sm font-medium">Fetching subscribers ...</p>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <MailCheck className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="text-base font-semibold text-slate-600">No newsletter subscribers found</p>
                  </td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-50/40 transition group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E2EE] flex items-center justify-center text-slate-600 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-slate-900 text-sm font-bold">
                          {s.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(s.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Active</span>
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setSubscriberToDelete(s);
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                        title="Unsubscribe / Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && subscriberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#382E42]">Unsubscribe Email?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to remove <span className="text-[#574B66] font-bold">"{subscriberToDelete.email}"</span> from the newsletter list?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2EE]">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSubscriberToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Removal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
