import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Inbox,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Eye,
  MessageSquare
} from 'lucide-react';

export function InquiriesPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;

      const res = await api.get('/admin/contacts', { params });
      if (res.data.result === 'success') {
        setContacts(res.data.contacts);
      }
    } catch (err) {
      showToast('error', 'Failed to load contact inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openViewModal = (c) => {
    setSelectedContact(c);
    setIsViewModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/contacts/${contactToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Inquiry deleted successfully');
        setDeleteModalOpen(false);
        setContactToDelete(null);
        fetchContacts();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete inquiry');
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
            <Inbox className="w-7 h-7 text-[#574B66]" />
            <span>Contact Inquiries & Submissions</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            View and manage prospective client messages submitted via the website contact form.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchContacts}
            className="p-2.5 text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] rounded-xl transition border border-[#E8E2EE]"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
            onKeyDown={(e) => e.key === 'Enter' && fetchContacts()}
            placeholder="Search inquiries by sender name, email, or message content..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
          />
        </div>
      </div>

      {/* Inquiries Data Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
              <tr>
                <th className="px-5 py-3.5">Client Contact</th>
                <th className="px-4 py-3.5">Subject & Message Preview</th>
                <th className="px-4 py-3.5">Received Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#574B66] mb-3" />
                    <p className="text-sm font-medium">Fetching client inquiries ...</p>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <Inbox className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="text-base font-semibold text-slate-600">No contact inquiries found</p>
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-50/40 transition group">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="font-bold text-[#382E42] text-sm group-hover:text-[#574B66] transition">
                          {c.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {c.email}
                          </span>
                          {c.phone_number && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {c.phone_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="min-w-0 max-w-md">
                        {c.subject && (
                          <p className="font-semibold text-slate-800 text-xs truncate">
                            {c.subject}
                          </p>
                        )}
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                          {c.message}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-mono text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(c.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(c)}
                          className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                          title="View Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setContactToDelete(c);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Message Modal */}
      {isViewModalOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 md:p-8 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE]">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5 text-[#574B66]" />
                <h2 className="text-lg font-extrabold text-[#382E42]">Client Inquiry Details</h2>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-[#E8E2EE]">
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">Sender Name</span>
                  <span className="font-bold text-[#382E42] text-base">{selectedContact.name}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">Date Received</span>
                  <span className="text-slate-700 font-mono text-xs">
                    {new Date(selectedContact.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">Email Address</span>
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="text-rose-300 hover:underline font-mono text-xs"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase text-slate-400">Phone Number</span>
                  <a
                    href={`tel:${selectedContact.phone_number}`}
                    className="text-slate-700 font-mono text-xs"
                  >
                    {selectedContact.phone_number || 'N/A'}
                  </a>
                </div>
              </div>

              {selectedContact.subject && (
                <div>
                  <span className="block text-xs font-bold uppercase text-slate-600 mb-1">Subject</span>
                  <p className="p-3 rounded-xl bg-white border border-[#E8E2EE] font-semibold text-slate-900">
                    {selectedContact.subject}
                  </p>
                </div>
              )}

              <div>
                <span className="block text-xs font-bold uppercase text-slate-600 mb-1">Inquiry Message</span>
                <p className="p-4 rounded-xl bg-white border border-[#E8E2EE] text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedContact.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2EE]">
              <a
                href={`mailto:${selectedContact.email}?subject=RE: FTPL Inquiry`}
                className="px-4 py-2 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply via Email</span>
              </a>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-brand-50/40 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#382E42]">Delete Contact Inquiry?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to remove the message from <span className="text-[#574B66] font-bold">"{contactToDelete.name}"</span>?
                This action is permanent and removes the submission .
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2EE]">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setContactToDelete(null);
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
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
