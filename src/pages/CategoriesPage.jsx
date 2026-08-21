import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  FolderTree,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Layers,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [parentFilter, setParentFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    parent_category: '',
    description: '',
    order: 0,
    status: 1,
    navigation_status: 1,
    home_status: 1,
    seo_title: '',
    seo_keyword: '',
    seo_description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (parentFilter !== 'all') params.parent = parentFilter;

      const res = await api.get('/admin/categories', { params });
      if (res.data.result === 'success') {
        setCategories(res.data.categories);
      }
    } catch (err) {
      showToast('error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [parentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCategories();
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentCategory(null);
    setFormData({
      title: '',
      slug: '',
      parent_category: '',
      description: '',
      order: categories.length + 1,
      status: 1,
      navigation_status: 1,
      home_status: 1,
      seo_title: '',
      seo_keyword: '',
      seo_description: '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setModalMode('edit');
    setCurrentCategory(cat);
    setFormData({
      title: cat.title || '',
      slug: cat.slug || '',
      parent_category: cat.parent_category || '',
      description: cat.description || '',
      order: cat.order ?? 0,
      status: cat.status ?? 1,
      navigation_status: cat.navigation_status ?? 1,
      home_status: cat.home_status ?? 1,
      seo_title: cat.seo_title || '',
      seo_keyword: cat.seo_keyword || '',
      seo_description: cat.seo_description || '',
    });
    setSelectedFile(null);
    setPreviewUrl(cat.image || null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Category title is required');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title);
      if (formData.slug) data.append('slug', formData.slug);
      data.append('parent_category', formData.parent_category);
      data.append('description', formData.description || '');
      data.append('order', formData.order);
      data.append('status', formData.status);
      data.append('navigation_status', formData.navigation_status);
      data.append('home_status', formData.home_status);
      data.append('seo_title', formData.seo_title || '');
      data.append('seo_keyword', formData.seo_keyword || '');
      data.append('seo_description', formData.seo_description || '');

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (modalMode === 'create') {
        const res = await api.post('/admin/categories', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Category created successfully');
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await api.put(`/admin/categories/${currentCategory.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Category updated successfully');
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const res = await api.patch(`/admin/categories/${cat.id}/status`);
      if (res.data.result === 'success') {
        setCategories((prev) =>
          prev.map((item) =>
            item.id === cat.id ? { ...item, status: res.data.status } : item
          )
        );
        showToast(
          'success',
          `Category ${res.data.status === 1 ? 'activated' : 'deactivated'}`
        );
      }
    } catch (err) {
      showToast('error', 'Failed to toggle category status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/categories/${categoryToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Category deleted successfully');
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  const rootCategories = categories.filter(
    (c) => !c.parent_category || c.parent_category === '0' || c.parent_category === ''
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#382E42] tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-[#574B66]" />
            <span>Category Catalog</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage heavy equipment classifications, hierarchy nesting, and media assets.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E2EE] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or slug..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filter:</span>
          </div>
          <select
            value={parentFilter}
            onChange={(e) => setParentFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
          >
            <option value="all">All Categories ({categories.length})</option>
            <option value="root">Top-Level Parents Only</option>
            {rootCategories.map((rc) => (
              <option key={rc.id} value={rc.id}>
                Subcategories of: {rc.title}
              </option>
            ))}
          </select>

          <button
            onClick={fetchCategories}
            className="p-2 text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] rounded-xl transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Categories Data Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
              <tr>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-4 py-3.5">Hierarchy</th>
                <th className="px-4 py-3.5 text-center">Subcategories</th>
                <th className="px-4 py-3.5 text-center">Products</th>
                <th className="px-4 py-3.5 text-center">Order</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#574B66] mb-3" />
                    <p className="text-sm font-medium">Fetching categories ...</p>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <FolderTree className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="text-base font-semibold text-slate-600">No categories found</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Try clearing filters or click "Add New Category" to create one.
                    </p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-brand-50/40 transition group"
                  >
                    {/* Category Title & Image */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.title}
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
                            {cat.title}
                          </p>
                          <p className="text-xs font-mono text-slate-400 truncate">
                            /{cat.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Hierarchy Badge */}
                    <td className="px-4 py-4">
                      {cat.parent_category ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#D6969D]/20 text-[#8C3F4B] border border-[#D6969D]/30 font-bold">
                          <span>Subcategory</span>
                          {cat.parent_title && (
                            <>
                              <ChevronRight className="w-3 h-3 text-[#574B66]" />
                              <span className="truncate max-w-[120px]">{cat.parent_title}</span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#574B66]/10 text-[#574B66] border border-[#574B66]/20 font-bold">
                          Top Level Parent
                        </span>
                      )}
                    </td>

                    {/* Subcategories count */}
                    <td className="px-4 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-md bg-surface-base text-xs font-mono text-slate-700">
                        {cat.subcategory_count}
                      </span>
                    </td>

                    {/* Products count */}
                    <td className="px-4 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-md bg-surface-base text-xs font-mono text-slate-700">
                        {cat.product_count}
                      </span>
                    </td>

                    {/* Order Index */}
                    <td className="px-4 py-4 text-center font-mono text-xs text-slate-600">
                      #{cat.order}
                    </td>

                    {/* Status Toggle */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          cat.status === 1
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-surface-base text-slate-400 border border-[#E8E2EE] hover:bg-slate-700 hover:text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.status === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                        <span>{cat.status === 1 ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCategoryToDelete(cat);
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#382E42]">
                  {modalMode === 'create' ? 'Create New Category' : 'Edit Category'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Configure classification hierarchy, media banner, and SEO tags.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    Category Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. IBR Steam Boilers"
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
                    placeholder="e.g. ibr-steam-boilers"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>
              </div>

              {/* Hierarchy Parent Selector & Order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    Parent Category
                  </label>
                  <select
                    value={formData.parent_category}
                    onChange={(e) => setFormData({ ...formData, parent_category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  >
                    <option value="">None (Top-Level Parent Category)</option>
                    {rootCategories
                      .filter((c) => !currentCategory || c.id !== currentCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                </div>

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
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Category Image Banner (Media Storage)
                </label>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#E8E2EE]">
                  <div className="w-20 h-20 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-base hover:bg-slate-700 text-xs font-bold text-[#382E42] cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose New Image</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Recommended formats: High-resolution WebP, PNG, or JPG (Max 5MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Description / Overview
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of machinery under this category..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              {/* Status checkboxes */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#E8E2EE]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.status === 1}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-[#574B66] bg-surface-base border-[#E8E2EE] focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                  <span>Active Status</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.navigation_status === 1}
                    onChange={(e) => setFormData({ ...formData, navigation_status: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-[#574B66] bg-surface-base border-[#E8E2EE] focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                  <span>Nav Menu</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.home_status === 1}
                    onChange={(e) => setFormData({ ...formData, home_status: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-[#574B66] bg-surface-base border-[#E8E2EE] focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                  <span>Featured Home</span>
                </label>
              </div>

              {/* SEO Meta Tags (Collapsible) */}
              <div className="p-4 rounded-xl bg-white border border-[#E8E2EE] space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  SEO & Search Metadata
                </p>
                <div>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    placeholder="SEO Title"
                    className="w-full px-3 py-2 bg-white border border-[#E8E2EE]/60 rounded-lg text-xs text-slate-900"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={formData.seo_keyword}
                    onChange={(e) => setFormData({ ...formData, seo_keyword: e.target.value })}
                    placeholder="SEO Keywords (comma separated)"
                    className="w-full px-3 py-2 bg-white border border-[#E8E2EE]/60 rounded-lg text-xs text-slate-900"
                  />
                </div>
                <div>
                  <textarea
                    rows="2"
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    placeholder="SEO Meta Description"
                    className="w-full px-3 py-2 bg-white border border-[#E8E2EE]/60 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Form Buttons */}
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
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'create' ? 'Create Category' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#382E42]">Delete Category?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to delete <span className="text-[#574B66] font-bold">"{categoryToDelete.title}"</span>?
                {categoryToDelete.subcategory_count > 0 && (
                  <span className="block mt-2 text-xs text-amber-400">
                    ⚠️ Note: This category has {categoryToDelete.subcategory_count} subcategories which will be moved to top-level.
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2EE]">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
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
