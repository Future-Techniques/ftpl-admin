import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  HelpCircle,
  FolderTree,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  MessageSquare,
  Tag
} from 'lucide-react';

export function FaqsPage() {
  const [activeTab, setActiveTab] = useState('faqs'); // 'faqs' | 'types'
  const [faqs, setFaqs] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // FAQ Modal State
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqModalMode, setFaqModalMode] = useState('create');
  const [currentFaq, setCurrentFaq] = useState(null);
  const [faqFormData, setFaqFormData] = useState({
    question: '',
    answer: '',
    slug: '',
    type_id: '',
    status: 1,
  });

  // Type Modal State
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState('create');
  const [currentType, setCurrentType] = useState(null);
  const [typeFormData, setTypeFormData] = useState({
    title: '',
    slug: '',
    status: 1,
  });

  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('faq'); // 'faq' | 'type'
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesRes, faqsRes] = await Promise.all([
        api.get('/admin/faqs/types'),
        api.get('/admin/faqs', {
          params: {
            search: search || undefined,
            type_id: typeFilter !== 'all' ? typeFilter : undefined,
          },
        }),
      ]);

      if (typesRes.data.result === 'success') {
        setTypes(typesRes.data.types);
      }
      if (faqsRes.data.result === 'success') {
        setFaqs(faqsRes.data.faqs);
      }
    } catch (err) {
      showToast('error', 'Failed to load FAQ records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // FAQ Handlers
  const openCreateFaqModal = () => {
    setFaqModalMode('create');
    setCurrentFaq(null);
    setFaqFormData({
      question: '',
      answer: '',
      slug: '',
      type_id: types.length > 0 ? String(types[0].id) : '1',
      status: 1,
    });
    setFaqModalOpen(true);
  };

  const openEditFaqModal = (f) => {
    setFaqModalMode('edit');
    setCurrentFaq(f);
    setFaqFormData({
      question: f.question || '',
      answer: f.answer || '',
      slug: f.slug || '',
      type_id: f.type_id ? String(f.type_id) : '',
      status: f.status ?? 1,
    });
    setFaqModalOpen(true);
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    if (!faqFormData.question.trim() || !faqFormData.answer.trim()) {
      showToast('error', 'Both question and answer are required');
      return;
    }

    try {
      setSubmitting(true);
      if (faqModalMode === 'create') {
        const res = await api.post('/admin/faqs', faqFormData);
        if (res.data.result === 'success') {
          showToast('success', 'FAQ created successfully');
          setFaqModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/admin/faqs/${currentFaq.id}`, faqFormData);
        if (res.data.result === 'success') {
          showToast('success', 'FAQ updated successfully');
          setFaqModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // FAQ Type Handlers
  const openCreateTypeModal = () => {
    setTypeModalMode('create');
    setCurrentType(null);
    setTypeFormData({
      title: '',
      slug: '',
      status: 1,
    });
    setTypeModalOpen(true);
  };

  const openEditTypeModal = (t) => {
    setTypeModalMode('edit');
    setCurrentType(t);
    setTypeFormData({
      title: t.title || '',
      slug: t.slug || '',
      status: t.status ?? 1,
    });
    setTypeModalOpen(true);
  };

  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    if (!typeFormData.title.trim()) {
      showToast('error', 'FAQ type title is required');
      return;
    }

    try {
      setSubmitting(true);
      if (typeModalMode === 'create') {
        const res = await api.post('/admin/faqs/types', typeFormData);
        if (res.data.result === 'success') {
          showToast('success', 'FAQ type created successfully');
          setTypeModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/admin/faqs/types/${currentType.id}`, typeFormData);
        if (res.data.result === 'success') {
          showToast('success', 'FAQ type updated successfully');
          setTypeModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFaqStatus = async (f) => {
    try {
      const res = await api.patch(`/admin/faqs/${f.id}/status`);
      if (res.data.result === 'success') {
        setFaqs((prev) =>
          prev.map((item) => (item.id === f.id ? { ...item, status: res.data.status } : item))
        );
        showToast('success', `FAQ ${res.data.status === 1 ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      showToast('error', 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      if (deleteType === 'faq') {
        const res = await api.delete(`/admin/faqs/${itemToDelete.id}`);
        if (res.data.result === 'success') {
          showToast('success', 'FAQ deleted successfully');
        }
      } else {
        const res = await api.delete(`/admin/faqs/types/${itemToDelete.id}`);
        if (res.data.result === 'success') {
          showToast('success', 'FAQ type deleted successfully');
        }
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete');
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
            <HelpCircle className="w-7 h-7 text-[#574B66]" />
            <span>Frequently Asked Questions (FAQs)</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage customer help questions grouped by categories (Product Question, General Question).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'faqs' ? (
            <button
              onClick={openCreateFaqModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
            </button>
          ) : (
            <button
              onClick={openCreateTypeModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-[#E8E2EE] pb-3">
        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'faqs'
              ? 'bg-[#574B66] text-white shadow-md shadow-brand-600/25'
              : 'text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6]/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>All FAQs ({faqs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'types'
              ? 'bg-[#574B66] text-white shadow-md shadow-brand-600/25'
              : 'text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6]/60'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>FAQ Grouping Types ({types.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E2EE] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                placeholder="Search FAQs by question or answer keywords..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                <span>Type:</span>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
              >
                <option value="all">All Types</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchData}
                className="p-2 text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] rounded-xl transition"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* FAQs Table */}
          <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
                  <tr>
                    <th className="px-5 py-3.5">Question & Answer Preview</th>
                    <th className="px-4 py-3.5">FAQ Category</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#574B66] mb-3" />
                        <p className="text-sm font-medium">Fetching FAQs ...</p>
                      </td>
                    </tr>
                  ) : faqs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                        <HelpCircle className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                        <p className="text-base font-semibold text-slate-600">No FAQs found</p>
                      </td>
                    </tr>
                  ) : (
                    faqs.map((f) => (
                      <tr key={f.id} className="hover:bg-brand-50/40 transition group">
                        <td className="px-5 py-4">
                          <div className="min-w-0 max-w-xl">
                            <p className="font-bold text-[#382E42] text-sm group-hover:text-[#574B66] transition">
                              {f.question}
                            </p>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {f.answer ? f.answer.replace(/<[^>]*>?/gm, '') : ''}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#574B66]/10 text-[#574B66] border border-[#574B66]/20 font-bold">
                            {f.type_title}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleToggleFaqStatus(f)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              f.status === 1
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-surface-base text-slate-400 border border-[#E8E2EE] hover:bg-slate-700 hover:text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                f.status === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                              }`}
                            />
                            <span>{f.status === 1 ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditFaqModal(f)}
                              className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                              title="Edit FAQ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(f);
                                setDeleteType('faq');
                                setDeleteModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                              title="Delete FAQ"
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
        </div>
      )}

      {/* TAB 2: FAQ TYPES */}
      {activeTab === 'types' && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
                  <tr>
                    <th className="px-5 py-3.5">FAQ Grouping Title</th>
                    <th className="px-4 py-3.5">URL Slug</th>
                    <th className="px-4 py-3.5 text-center">Assigned Questions</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {types.map((t) => (
                    <tr key={t.id} className="hover:bg-brand-50/40 transition group">
                      <td className="px-5 py-4 font-bold text-[#382E42] group-hover:text-[#574B66] transition">
                        {t.title}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">
                        /{t.slug}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-md bg-surface-base text-xs font-mono text-slate-700">
                          {t.faq_count} Questions
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditTypeModal(t)}
                            className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                            title="Edit Type"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(t);
                              setDeleteType('type');
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                            title="Delete Type"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit FAQ Modal */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 md:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6">
              <h2 className="text-xl font-extrabold text-[#382E42]">
                {faqModalMode === 'create' ? 'Add FAQ Item' : 'Edit FAQ Item'}
              </h2>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  FAQ Question *
                </label>
                <input
                  type="text"
                  required
                  value={faqFormData.question}
                  onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                  placeholder="e.g. What is the standard lifespan of a steam boiler?"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  FAQ Category / Grouping *
                </label>
                <select
                  required
                  value={faqFormData.type_id}
                  onChange={(e) => setFaqFormData({ ...faqFormData, type_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                >
                  <option value="">Select Category...</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Detailed Answer *
                </label>
                <textarea
                  rows="5"
                  required
                  value={faqFormData.answer}
                  onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                  placeholder="Comprehensive technical answer / solution..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={faqFormData.status === 1}
                    onChange={(e) => setFaqFormData({ ...faqFormData, status: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-[#574B66] bg-surface-base border-[#E8E2EE] focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                  <span>Active FAQ Publication Status</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2EE]">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-brand-50/40 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center gap-2 disabled:opacity-50 transition"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{faqModalMode === 'create' ? 'Create FAQ' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Type Modal */}
      {typeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6">
              <h2 className="text-lg font-extrabold text-[#382E42]">
                {typeModalMode === 'create' ? 'Create FAQ Category' : 'Edit FAQ Category'}
              </h2>
              <button
                onClick={() => setTypeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTypeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Category Title *
                </label>
                <input
                  type="text"
                  required
                  value={typeFormData.title}
                  onChange={(e) => setTypeFormData({ ...typeFormData, title: e.target.value })}
                  placeholder="e.g. Technical Support, Billing"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={typeFormData.slug}
                  onChange={(e) => setTypeFormData({ ...typeFormData, slug: e.target.value })}
                  placeholder="e.g. technical-support"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2EE]">
                <button
                  type="button"
                  onClick={() => setTypeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : typeModalMode === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#382E42]">
                Delete {deleteType === 'faq' ? 'FAQ Item' : 'FAQ Category'}?
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to delete <span className="text-[#574B66] font-bold">"{itemToDelete.question || itemToDelete.title}"</span>?
                This action is permanent and removes the item .
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2EE]">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
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
