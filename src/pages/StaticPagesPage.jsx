import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  SearchCode,
  Globe2
} from 'lucide-react';

export function StaticPagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentPage, setCurrentPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    summary: '',
    seo_title: '',
    seo_keyword: '',
    seo_description: '',
    status: 1,
  });

  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/admin/pages', { params });
      if (res.data.result === 'success') {
        setPages(res.data.pages);
      }
    } catch (err) {
      showToast('error', 'Failed to load static pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [statusFilter]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentPage(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      summary: '',
      seo_title: '',
      seo_keyword: '',
      seo_description: '',
      status: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setModalMode('edit');
    setCurrentPage(p);
    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      description: p.description || '',
      summary: p.summary || '',
      seo_title: p.seo_title || '',
      seo_keyword: p.seo_keyword || '',
      seo_description: p.seo_description || '',
      status: p.status ?? 1,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Page title is required');
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        const res = await api.post('/admin/pages', formData);
        if (res.data.result === 'success') {
          showToast('success', 'Static page created successfully');
          setIsModalOpen(false);
          fetchPages();
        }
      } else {
        const res = await api.put(`/admin/pages/${currentPage.id}`, formData);
        if (res.data.result === 'success') {
          showToast('success', 'Static page updated successfully');
          setIsModalOpen(false);
          fetchPages();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (p) => {
    try {
      const res = await api.patch(`/admin/pages/${p.id}/status`);
      if (res.data.result === 'success') {
        setPages((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, status: res.data.status } : item))
        );
        showToast('success', `Page ${res.data.status === 1 ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      showToast('error', 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pageToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/pages/${pageToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Static page deleted successfully');
        setDeleteModalOpen(false);
        setPageToDelete(null);
        fetchPages();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete page');
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
            <FileText className="w-7 h-7 text-[#574B66]" />
            <span>Static Pages & SEO Management</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage corporate static pages (About Us, Company Profile, Services, Privacy Policy, Terms) and SEO tags.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Static Page</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E2EE] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPages()}
            placeholder="Search pages by title, slug, or content..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
          >
            <option value="all">All Status</option>
            <option value="1">Active Only</option>
            <option value="0">Inactive Only</option>
          </select>

          <button
            onClick={fetchPages}
            className="p-2 text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] rounded-xl transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Pages Data Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
              <tr>
                <th className="px-5 py-3.5">Page Title & Slug</th>
                <th className="px-4 py-3.5">SEO Meta Tags</th>
                <th className="px-4 py-3.5">Last Updated</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#574B66] mb-3" />
                    <p className="text-sm font-medium">Fetching pages ...</p>
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="text-base font-semibold text-slate-600">No static pages found</p>
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-50/40 transition group">
                    <td className="px-5 py-4">
                      <div className="min-w-0 max-w-sm">
                        <p className="font-bold text-[#382E42] text-sm group-hover:text-[#574B66] transition truncate">
                          {p.title}
                        </p>
                        <p className="text-xs font-mono text-slate-400 truncate mt-0.5">
                          /page/{p.slug}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {p.seo_title ? (
                        <div className="flex items-center gap-1.5 text-xs text-rose-300 max-w-xs truncate">
                          <SearchCode className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{p.seo_title}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 font-mono">Default SEO</span>
                      )}
                    </td>

                    <td className="px-4 py-4 font-mono text-xs text-slate-600">
                      {new Date(p.updated_at || p.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          p.status === 1
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-surface-base text-slate-400 border border-[#E8E2EE] hover:bg-slate-700 hover:text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        <span>{p.status === 1 ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                          title="Edit Page"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPageToDelete(p);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Delete Page"
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

      {/* Create / Edit Page Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 md:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6">
              <h2 className="text-xl font-extrabold text-[#382E42]">
                {modalMode === 'create' ? 'Create Static Page' : 'Edit Static Page'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. About Us, Corporate Profile"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. about-us"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Summary / Excerpt
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Short introductory summary for search cards and header..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Page Content (HTML / Rich Text)
                </label>
                <textarea
                  rows="6"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="HTML page body markup, paragraphs, tables, lists..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              {/* SEO Sub-section */}
              <div className="p-4 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-300">
                  <Globe2 className="w-4 h-4" />
                  <span>Search Engine Optimization (SEO Metadata)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Meta SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      placeholder="About FTPL | Industrial Solutions"
                      className="w-full px-3 py-2 bg-white border border-[#E8E2EE] rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      SEO Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.seo_keyword}
                      onChange={(e) => setFormData({ ...formData, seo_keyword: e.target.value })}
                      placeholder="boiler nepal, water treatment, tas"
                      className="w-full px-3 py-2 bg-white border border-[#E8E2EE] rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Meta SEO Description
                  </label>
                  <textarea
                    rows="2"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="Short description snippet for search engine indexers..."
                    className="w-full px-3 py-2 bg-white border border-[#E8E2EE] rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.status === 1}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-[#574B66] bg-surface-base border-[#E8E2EE] focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                  <span>Active Page Status</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2EE]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                    <span>{modalMode === 'create' ? 'Create Page' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && pageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#382E42]">Delete Static Page?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to delete <span className="text-[#574B66] font-bold">"{pageToDelete.title}"</span>?
                This action is permanent and removes the page .
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2EE]">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPageToDelete(null);
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
