import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
  Globe
} from 'lucide-react';

export function SisterConcernsPage() {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentConcern, setCurrentConcern] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    link: '',
    order: 0,
    status: 1,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [concernToDelete, setConcernToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchConcerns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/admin/concerns', { params });
      if (res.data.result === 'success') {
        setConcerns(res.data.concerns);
      }
    } catch (err) {
      showToast('error', 'Failed to load sister concerns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerns();
  }, [statusFilter]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentConcern(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      link: '',
      order: concerns.length + 1,
      status: 1,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setModalMode('edit');
    setCurrentConcern(c);
    setFormData({
      title: c.title || '',
      slug: c.slug || '',
      description: c.description || '',
      link: c.link || '',
      order: c.order ?? 0,
      status: c.status ?? 1,
    });
    setImageFile(null);
    setImagePreview(c.image || null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Corporate entity name is required');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      if (formData.slug) data.append('slug', formData.slug.trim());
      data.append('description', formData.description || '');
      data.append('link', formData.link || '');
      data.append('order', formData.order);
      data.append('status', formData.status);

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (modalMode === 'create') {
        const res = await api.post('/admin/concerns', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Sister concern created successfully');
          setIsModalOpen(false);
          fetchConcerns();
        }
      } else {
        const res = await api.put(`/admin/concerns/${currentConcern.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Sister concern updated successfully');
          setIsModalOpen(false);
          fetchConcerns();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (c) => {
    try {
      const res = await api.patch(`/admin/concerns/${c.id}/status`);
      if (res.data.result === 'success') {
        setConcerns((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, status: res.data.status } : item))
        );
        showToast('success', `Entity ${res.data.status === 1 ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      showToast('error', 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!concernToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/concerns/${concernToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Sister concern deleted successfully');
        setDeleteModalOpen(false);
        setConcernToDelete(null);
        fetchConcerns();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete entity');
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
            <Building2 className="w-7 h-7 text-[#574B66]" />
            <span>Sister Concerns & Group Enterprises</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage partner corporate entities (Technical Associates, Healthcare Technologies, Sigma Technologies).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sister Concern</span>
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
            onKeyDown={(e) => e.key === 'Enter' && fetchConcerns()}
            placeholder="Search sister concerns by corporate name..."
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
            onClick={fetchConcerns}
            className="p-2 text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] rounded-xl transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Concerns Data Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
              <tr>
                <th className="px-5 py-3.5">Corporate Entity</th>
                <th className="px-4 py-3.5">Website Link</th>
                <th className="px-4 py-3.5 text-center">Order</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#574B66] mb-3" />
                    <p className="text-sm font-medium">Fetching sister concerns ...</p>
                  </td>
                </tr>
              ) : concerns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="text-base font-semibold text-slate-600">No sister concerns found</p>
                  </td>
                </tr>
              ) : (
                concerns.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-50/40 transition group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-12 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {c.image ? (
                            <img
                              src={c.image}
                              alt={c.title}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-700" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#382E42] text-sm group-hover:text-[#574B66] transition truncate max-w-sm">
                            {c.title}
                          </p>
                          <p className="text-xs font-mono text-slate-400 truncate max-w-xs">
                            /{c.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {c.link && c.link !== '#' ? (
                        <a
                          href={c.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-mono transition"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">{c.link}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600 font-mono">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-center font-mono text-xs text-slate-600">
                      #{c.order}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          c.status === 1
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-surface-base text-slate-400 border border-[#E8E2EE] hover:bg-slate-700 hover:text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        <span>{c.status === 1 ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                          title="Edit Entity"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setConcernToDelete(c);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Delete Entity"
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

      {/* Create / Edit Concern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 md:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6">
              <h2 className="text-xl font-extrabold text-[#382E42]">
                {modalMode === 'create' ? 'Add Sister Concern' : 'Edit Sister Concern'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Corporate Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. TECHNICAL ASSOCIATES SERVICES PVT. LTD."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. technical-associates"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    External Website URL
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://tas.com.np"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Corporate Logo (Media Storage)
                </label>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#E8E2EE]">
                  <div className="w-20 h-16 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-base hover:bg-slate-700 text-xs font-bold text-[#382E42] cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Recommended formats: WebP, PNG, JPG, or SVG (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Business Scope / Profile (HTML)
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of core operations, representations, and product lines..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.status === 1}
                      onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded text-[#574B66] bg-surface-base border-[#E8E2EE] focus:ring-[#574B66]/20 focus:border-[#574B66]"
                    />
                    <span>Active Publication Status</span>
                  </label>
                </div>
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
                    <span>{modalMode === 'create' ? 'Create Entity' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && concernToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#382E42]">Delete Sister Concern?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to delete <span className="text-[#574B66] font-bold">"{concernToDelete.title}"</span>?
                This action is permanent and removes the corporate entity .
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2EE]">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setConcernToDelete(null);
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
