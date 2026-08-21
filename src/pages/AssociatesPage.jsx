import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Handshake,
  FolderTree,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Loader2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  FileDown,
  Globe,
  ExternalLink,
  Eye
} from 'lucide-react';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';

export function AssociatesPage() {
  const [activeTab, setActiveTab] = useState('associates'); // 'associates' | 'categories'
  const [associates, setAssociates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // In-App Document Viewer State
  const [docViewer, setDocViewer] = useState({ isOpen: false, url: '', title: '' });

  // Associate Modal State
  const [assocModalOpen, setAssocModalOpen] = useState(false);
  const [assocModalMode, setAssocModalMode] = useState('create');
  const [currentAssoc, setCurrentAssoc] = useState(null);
  const [assocFormData, setAssocFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    link: '',
    order: 0,
    status: 1,
  });
  const [assocImageFile, setAssocImageFile] = useState(null);
  const [assocImagePreview, setAssocImagePreview] = useState(null);
  const [assocPdfFile, setAssocPdfFile] = useState(null);
  const [assocPdfFileName, setAssocPdfFileName] = useState('');

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catModalMode, setCatModalMode] = useState('create');
  const [currentCat, setCurrentCat] = useState(null);
  const [catFormData, setCatFormData] = useState({
    title: '',
    slug: '',
    description: '',
    order: 0,
    status: 1,
  });

  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('associate'); // 'associate' | 'category'
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, assocRes] = await Promise.all([
        api.get('/admin/associates/categories'),
        api.get('/admin/associates', {
          params: {
            search: search || undefined,
            category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
          },
        }),
      ]);

      if (catsRes.data.result === 'success') {
        setCategories(catsRes.data.categories);
      }
      if (assocRes.data.result === 'success') {
        setAssociates(assocRes.data.associates);
      }
    } catch (err) {
      showToast('error', 'Failed to load partners data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Associate Handlers
  const openCreateAssocModal = () => {
    setAssocModalMode('create');
    setCurrentAssoc(null);
    setAssocFormData({
      title: '',
      slug: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      link: '',
      order: associates.length + 1,
      status: 1,
    });
    setAssocImageFile(null);
    setAssocImagePreview(null);
    setAssocPdfFile(null);
    setAssocPdfFileName('');
    setAssocModalOpen(true);
  };

  const openEditAssocModal = (a) => {
    setAssocModalMode('edit');
    setCurrentAssoc(a);
    setAssocFormData({
      title: a.title || '',
      slug: a.slug || '',
      category_id: a.category_id ? String(a.category_id) : '',
      link: a.link || '',
      order: a.order ?? 0,
      status: a.status ?? 1,
    });
    setAssocImageFile(null);
    setAssocImagePreview(a.image || null);
    setAssocPdfFile(null);
    setAssocPdfFileName(a.raw_pdf || '');
    setAssocModalOpen(true);
  };

  const handleAssocSubmit = async (e) => {
    e.preventDefault();
    if (!assocFormData.title.trim()) {
      showToast('error', 'Partner brand name is required');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', assocFormData.title.trim());
      if (assocFormData.slug) data.append('slug', assocFormData.slug.trim());
      if (assocFormData.category_id) data.append('category_id', assocFormData.category_id);
      data.append('link', assocFormData.link || '');
      data.append('order', assocFormData.order);
      data.append('status', assocFormData.status);

      if (assocImageFile) data.append('image', assocImageFile);
      if (assocPdfFile) data.append('pdf_file', assocPdfFile);

      if (assocModalMode === 'create') {
        const res = await api.post('/admin/associates', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Partner associate created successfully');
          setAssocModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/admin/associates/${currentAssoc.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Partner associate updated successfully');
          setAssocModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Category Handlers
  const openCreateCatModal = () => {
    setCatModalMode('create');
    setCurrentCat(null);
    setCatFormData({
      title: '',
      slug: '',
      description: '',
      order: categories.length + 1,
      status: 1,
    });
    setCatModalOpen(true);
  };

  const openEditCatModal = (c) => {
    setCatModalMode('edit');
    setCurrentCat(c);
    setCatFormData({
      title: c.title || '',
      slug: c.slug || '',
      description: c.description || '',
      order: c.order ?? 0,
      status: c.status ?? 1,
    });
    setCatModalOpen(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catFormData.title.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (catModalMode === 'create') {
        const res = await api.post('/admin/associates/categories', catFormData);
        if (res.data.result === 'success') {
          showToast('success', 'Category created successfully');
          setCatModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/admin/associates/categories/${currentCat.id}`, catFormData);
        if (res.data.result === 'success') {
          showToast('success', 'Category updated successfully');
          setCatModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAssocStatus = async (a) => {
    try {
      const res = await api.patch(`/admin/associates/${a.id}/status`);
      if (res.data.result === 'success') {
        setAssociates((prev) =>
          prev.map((item) => (item.id === a.id ? { ...item, status: res.data.status } : item))
        );
        showToast('success', `Associate ${res.data.status === 1 ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      showToast('error', 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      if (deleteType === 'associate') {
        const res = await api.delete(`/admin/associates/${itemToDelete.id}`);
        if (res.data.result === 'success') {
          showToast('success', 'Partner associate deleted successfully');
        }
      } else {
        const res = await api.delete(`/admin/associates/categories/${itemToDelete.id}`);
        if (res.data.result === 'success') {
          showToast('success', 'Association category deleted successfully');
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
            <Handshake className="w-7 h-7 text-[#574B66]" />
            <span>Associates & Global Representations</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage principal technology partners (Thermax, Grundfos, Alfa Laval, Endress+Hauser, Innmotek).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'associates' ? (
            <button
              onClick={openCreateAssocModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Partner Associate</span>
            </button>
          ) : (
            <button
              onClick={openCreateCatModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Grouping Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-[#E8E2EE] pb-3">
        <button
          onClick={() => setActiveTab('associates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'associates'
              ? 'bg-[#574B66] text-white shadow-md shadow-brand-600/25'
              : 'text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6]/60'
          }`}
        >
          <Handshake className="w-4 h-4" />
          <span>All Associates ({associates.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-[#574B66] text-white shadow-md shadow-brand-600/25'
              : 'text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6]/60'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Association Groupings ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL ASSOCIATES */}
      {activeTab === 'associates' && (
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
                placeholder="Search partner brands..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                <span>Grouping:</span>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
              >
                <option value="all">All Groupings</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
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

          {/* Associates Table */}
          <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
                  <tr>
                    <th className="px-5 py-3.5">Brand Partner</th>
                    <th className="px-4 py-3.5">Association Category</th>
                    <th className="px-4 py-3.5">Website / Brochure</th>
                    <th className="px-4 py-3.5 text-center">Order</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#574B66] mb-3" />
                        <p className="text-sm font-medium">Fetching partner brands ...</p>
                      </td>
                    </tr>
                  ) : associates.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                        <Handshake className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                        <p className="text-base font-semibold text-slate-600">No partner associates found</p>
                      </td>
                    </tr>
                  ) : (
                    associates.map((a) => (
                      <tr key={a.id} className="hover:bg-brand-50/40 transition group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-16 h-12 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                              {a.image ? (
                                <img
                                  src={a.image}
                                  alt={a.title}
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
                              <p className="font-bold text-[#382E42] text-sm group-hover:text-[#574B66] transition truncate">
                                {a.title}
                              </p>
                              <p className="text-xs font-mono text-slate-400 truncate">
                                /{a.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#574B66]/10 text-[#574B66] border border-[#574B66]/20 font-bold">
                            {a.category_title}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {a.link && a.link !== '#' && (
                              <a
                                href={a.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-base text-slate-700 hover:text-slate-900 text-xs font-mono transition"
                              >
                                <Globe className="w-3 h-3" />
                                <span>Site</span>
                              </a>
                            )}
                            {a.pdf_file && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDocViewer({
                                    isOpen: true,
                                    url: a.pdf_file,
                                    title: `${a.title} — Technical Brochure PDF`
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#574B66]/10 text-[#574B66] hover:bg-[#574B66] hover:text-white border border-[#574B66]/20 text-xs font-bold transition shadow-sm"
                              >
                                <FileDown className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                            )}
                            {!a.link && !a.pdf_file && (
                              <span className="text-xs text-slate-600 font-mono">—</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center font-mono text-xs text-slate-600">
                          #{a.order}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleToggleAssocStatus(a)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              a.status === 1
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-surface-base text-slate-400 border border-[#E8E2EE] hover:bg-slate-700 hover:text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                a.status === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                              }`}
                            />
                            <span>{a.status === 1 ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditAssocModal(a)}
                              className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                              title="Edit Associate"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(a);
                                setDeleteType('associate');
                                setDeleteModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                              title="Delete Associate"
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

      {/* TAB 2: ASSOCIATION CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
                  <tr>
                    <th className="px-5 py-3.5">Category Grouping</th>
                    <th className="px-4 py-3.5">URL Slug</th>
                    <th className="px-4 py-3.5 text-center">Associated Partners</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-brand-50/40 transition group">
                      <td className="px-5 py-4 font-bold text-[#382E42] group-hover:text-[#574B66] transition">
                        {c.title}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">
                        /{c.slug}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-md bg-surface-base text-xs font-mono text-slate-700">
                          {c.associate_count} Brands
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditCatModal(c)}
                            className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(c);
                              setDeleteType('category');
                              setDeleteModalOpen(true);
                            }}
                            className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                            title="Delete Category"
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

      {/* Create / Edit Associate Modal */}
      {assocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 md:p-8 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6">
              <h2 className="text-xl font-extrabold text-[#382E42]">
                {assocModalMode === 'create' ? 'Add Partner Associate' : 'Edit Partner Associate'}
              </h2>
              <button
                onClick={() => setAssocModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssocSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Brand / Partner Name *
                </label>
                <input
                  type="text"
                  required
                  value={assocFormData.title}
                  onChange={(e) => setAssocFormData({ ...assocFormData, title: e.target.value })}
                  placeholder="e.g. Thermax, Grundfos, Innmotek"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    Association Grouping *
                  </label>
                  <select
                    required
                    value={assocFormData.category_id}
                    onChange={(e) => setAssocFormData({ ...assocFormData, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  >
                    <option value="">Select Grouping...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    Official Website URL
                  </label>
                  <input
                    type="text"
                    value={assocFormData.link}
                    onChange={(e) => setAssocFormData({ ...assocFormData, link: e.target.value })}
                    placeholder="https://thermaxglobal.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Brand Logo (Media Storage)
                </label>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#E8E2EE]">
                  <div className="w-20 h-16 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0">
                    {assocImagePreview ? (
                      <img src={assocImagePreview} alt="Preview" className="w-full h-full object-contain p-1" />
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
                            setAssocImageFile(file);
                            setAssocImagePreview(URL.createObjectURL(file));
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

              {/* PDF Catalogue Attachment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  PDF Product Brochure (Optional)
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#574B66]/10 border border-[#574B66]/20 text-[#574B66] flex items-center justify-center shrink-0">
                      <FileDown className="w-5 h-5" />
                    </div>
                    <div>
                      {assocPdfFileName ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            {assocPdfFile ? assocPdfFile.name : 'Brochure PDF Attached'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Attached
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">No PDF brochure attached</span>
                      )}
                      <p className="text-[11px] text-slate-400">Accepted format: PDF (Max 15MB)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentAssociate?.pdf_file && !assocPdfFile && (
                      <button
                        type="button"
                        onClick={() =>
                          setDocViewer({
                            isOpen: true,
                            url: currentAssociate.pdf_file,
                            title: `${assocFormData.title || 'Partner'} — Technical Brochure PDF`
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#574B66] text-white text-xs font-bold hover:bg-[#463B53] shadow-sm transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>
                    )}

                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8E2EE] hover:bg-[#F0ECF4] text-xs font-bold text-[#574B66] cursor-pointer shadow-sm transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{assocPdfFileName ? 'Replace PDF' : 'Upload PDF'}</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setAssocPdfFile(file);
                            setAssocPdfFileName(file.name);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={assocFormData.order}
                    onChange={(e) => setAssocFormData({ ...assocFormData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={assocFormData.status === 1}
                      onChange={(e) => setAssocFormData({ ...assocFormData, status: e.target.checked ? 1 : 0 })}
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
                  onClick={() => setAssocModalOpen(false)}
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
                    <span>{assocModalMode === 'create' ? 'Create Partner' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6">
              <h2 className="text-lg font-extrabold text-[#382E42]">
                {catModalMode === 'create' ? 'Create Grouping Category' : 'Edit Grouping Category'}
              </h2>
              <button
                onClick={() => setCatModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Grouping Title *
                </label>
                <input
                  type="text"
                  required
                  value={catFormData.title}
                  onChange={(e) => setCatFormData({ ...catFormData, title: e.target.value })}
                  placeholder="e.g. We are partners with"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={catFormData.slug}
                  onChange={(e) => setCatFormData({ ...catFormData, slug: e.target.value })}
                  placeholder="e.g. we-are-partners-with"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={catFormData.description}
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                  placeholder="Section subtitle / explanation..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2EE]">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : catModalMode === 'create' ? 'Create' : 'Save'}
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
                Delete {deleteType === 'associate' ? 'Partner Associate' : 'Grouping Category'}?
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to delete <span className="text-[#574B66] font-bold">"{itemToDelete.title}"</span>?
                This action is permanent and removes the record .
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

      {/* In-App Technical Brochure Viewer Modal */}
      <DocumentViewerModal
        isOpen={docViewer.isOpen}
        onClose={() => setDocViewer({ isOpen: false, url: '', title: '' })}
        documentUrl={docViewer.url}
        title={docViewer.title}
      />
    </div>
  );
}
