import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Package,
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
  FileText,
  FileDown,
  Layers,
  Sparkles,
  X,
  RefreshCw,
  Eye,
  PlusCircle,
  Trash
} from 'lucide-react';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Document Viewer Modal State
  const [docViewer, setDocViewer] = useState({ isOpen: false, url: '', title: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'content' | 'media' | 'additionals' | 'seo'

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    description: '',
    feature_and_benefit: '',
    benefit_description: '',
    order: 0,
    status: 1,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  // Repeatable Additionals State
  const [additionalsList, setAdditionalsList] = useState([
    { title: '', description: '', image: '' }
  ]);

  // File states & previews
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);

  const [benefitImageFile, setBenefitImageFile] = useState(null);
  const [benefitImagePreview, setBenefitImagePreview] = useState(null);

  const [catalogueFile, setCatalogueFile] = useState(null);
  const [catalogueFileName, setCatalogueFileName] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data.result === 'success') {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter !== 'all') params.category_id = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/admin/products', { params });
      if (res.data.result === 'success') {
        setProducts(res.data.products);
      }
    } catch (err) {
      showToast('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentProduct(null);
    setActiveTab('basic');
    setFormData({
      title: '',
      slug: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      description: '',
      feature_and_benefit: '',
      benefit_description: '',
      order: products.length + 1,
      status: 1,
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
    });
    setAdditionalsList([{ title: '', description: '', image: '' }]);
    setMainImageFile(null);
    setMainImagePreview(null);
    setBenefitImageFile(null);
    setBenefitImagePreview(null);
    setCatalogueFile(null);
    setCatalogueFileName('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setModalMode('edit');
    setCurrentProduct(p);
    setActiveTab('basic');
    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      category_id: p.category_id ? String(p.category_id) : '',
      description: p.description || '',
      feature_and_benefit: p.feature_and_benefit || '',
      benefit_description: p.benefit_description || '',
      order: p.order ?? 0,
      status: p.status ?? 1,
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
      seo_keywords: p.seo_keywords || '',
    });

    const parsedAdd = Array.isArray(p.additionals) && p.additionals.length > 0
      ? p.additionals.map(a => ({ title: a.title || '', description: a.description || '', image: a.raw_image || a.image || '' }))
      : [{ title: '', description: '', image: '' }];
    setAdditionalsList(parsedAdd);

    setMainImageFile(null);
    setMainImagePreview(p.image || null);
    setBenefitImageFile(null);
    setBenefitImagePreview(p.benefit_image || null);
    setCatalogueFile(null);
    setCatalogueFileName(p.raw_catalogue || '');
    setIsModalOpen(true);
  };

  // Additionals Repeatable Handlers
  const addAdditionalRow = () => {
    setAdditionalsList([...additionalsList, { title: '', description: '', image: '' }]);
  };

  const removeAdditionalRow = (index) => {
    if (additionalsList.length === 1) {
      setAdditionalsList([{ title: '', description: '', image: '' }]);
      return;
    }
    setAdditionalsList(additionalsList.filter((_, idx) => idx !== index));
  };

  const updateAdditionalRow = (index, field, value) => {
    const updated = [...additionalsList];
    updated[index][field] = value;
    setAdditionalsList(updated);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Product title is required');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      if (formData.slug) data.append('slug', formData.slug.trim());
      if (formData.category_id) data.append('category_id', formData.category_id);
      data.append('description', formData.description || '');
      data.append('feature_and_benefit', formData.feature_and_benefit || '');
      data.append('benefit_description', formData.benefit_description || '');
      data.append('order', formData.order);
      data.append('status', formData.status);
      data.append('seo_title', formData.seo_title || '');
      data.append('seo_description', formData.seo_description || '');
      data.append('seo_keywords', formData.seo_keywords || '');

      // Clean additionals
      const cleanAdditionals = additionalsList.filter(a => a.title?.trim() || a.description?.trim() || a.image?.trim());
      data.append('additionals', JSON.stringify(cleanAdditionals));

      if (mainImageFile) data.append('image', mainImageFile);
      if (benefitImageFile) data.append('benefit_image', benefitImageFile);
      if (catalogueFile) data.append('catalogue', catalogueFile);

      if (modalMode === 'create') {
        const res = await api.post('/admin/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Product created successfully');
          setIsModalOpen(false);
          fetchProducts();
        }
      } else {
        const res = await api.put(`/admin/products/${currentProduct.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Product updated successfully');
          setIsModalOpen(false);
          fetchProducts();
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
      const res = await api.patch(`/admin/products/${p.id}/status`);
      if (res.data.result === 'success') {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === p.id ? { ...item, status: res.data.status } : item
          )
        );
        showToast('success', `Product ${res.data.status === 1 ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      showToast('error', 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/products/${productToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Product deleted successfully');
        setDeleteModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

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
            <Package className="w-7 h-7 text-[#574B66]" />
            <span>Industrial Machinery & Products</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage heavy engineering models, technical specifications, and brochure documents.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
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
            placeholder="Search machinery by model or slug..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

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
            onClick={fetchProducts}
            className="p-2 text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] rounded-xl transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
              <tr>
                <th className="px-5 py-3.5">Machinery Model</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5 text-center">Specifications</th>
                <th className="px-4 py-3.5 text-center">Catalogue</th>
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
                    <p className="text-sm font-medium">Fetching machinery listings ...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                    <p className="text-base font-semibold text-slate-600">No products found</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Try adjusting filters or click "Add New Product" to list machinery.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-50/40 transition group">
                    {/* Title & Image */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.title}
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
                            {p.title}
                          </p>
                          <p className="text-xs font-mono text-slate-400 truncate">
                            /{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#574B66]/10 text-[#574B66] border border-[#574B66]/20 font-bold">
                        {p.category_title || 'Uncategorized'}
                      </span>
                    </td>

                    {/* Specifications / Additionals count */}
                    <td className="px-4 py-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-md bg-surface-base text-xs font-mono text-slate-700">
                        {Array.isArray(p.additionals) ? p.additionals.length : 0} Blocks
                      </span>
                    </td>

                    {/* Catalogue PDF indicator */}
                    <td className="px-4 py-4 text-center">
                      {p.catalogue ? (
                        <a
                          href={p.catalogue}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-mono transition"
                          title="Open PDF Catalogue"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600 font-mono">—</span>
                      )}
                    </td>

                    {/* Order */}
                    <td className="px-4 py-4 text-center font-mono text-xs text-slate-600">
                      #{p.order}
                    </td>

                    {/* Status */}
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

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(p);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                          title="Delete Product"
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

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6 shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-[#382E42]">
                  {modalMode === 'create' ? 'Create New Machinery Listing' : 'Edit Machinery Listing'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Configure multi-tab parameters, brochures, and repeatable specification blocks.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-[#E8E2EE]/80 mb-6 shrink-0">
              {[
                { id: 'basic', label: '1. Basic & Category' },
                { id: 'content', label: '2. Features & Benefits' },
                { id: 'media', label: '3. Media & Brochure' },
                { id: 'additionals', label: `4. Specifications (${additionalsList.length})` },
                { id: 'seo', label: '5. SEO Meta' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#574B66] text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-brand-50/40/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6 flex-1">
              {/* TAB 1: BASIC & CATEGORY */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                        Product Model Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. THERMOPAC 5000"
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
                        placeholder="e.g. thermopac-5000"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                        Assigned Category *
                      </label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                      >
                        <option value="">Select Category...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.parent_title ? `${c.parent_title} > ${c.title}` : c.title}
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

                  <div className="pt-2">
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
              )}

              {/* TAB 2: FEATURES & BENEFITS */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                      Overview Description
                    </label>
                    <textarea
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Comprehensive summary of operating principles and architecture..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                      Features & Benefits Headline
                    </label>
                    <input
                      type="text"
                      value={formData.feature_and_benefit}
                      onChange={(e) => setFormData({ ...formData, feature_and_benefit: e.target.value })}
                      placeholder="e.g. Energy efficient coil design with instant heat dissipation"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                      Detailed Benefit Description / Bullet Points
                    </label>
                    <textarea
                      rows="4"
                      value={formData.benefit_description}
                      onChange={(e) => setFormData({ ...formData, benefit_description: e.target.value })}
                      placeholder="List key advantages, operational efficiencies, temperature ranges..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA & BROCHURES */}
              {activeTab === 'media' && (
                <div className="space-y-5">
                  {/* Main Product Image */}
                  <div className="p-4 rounded-xl bg-white border border-[#E8E2EE]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-2">
                      Main Product Image (Primary Hero)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {mainImagePreview ? (
                          <img src={mainImagePreview} alt="Main Preview" className="w-full h-full object-contain p-1" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-base hover:bg-slate-700 text-xs font-bold text-[#382E42] cursor-pointer transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Main Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setMainImageFile(file);
                                setMainImagePreview(URL.createObjectURL(file));
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Recommended format: High-resolution WebP or PNG.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Benefit Section Image */}
                  <div className="p-4 rounded-xl bg-white border border-[#E8E2EE]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-2">
                      Benefit Section Diagram / Graphic
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {benefitImagePreview ? (
                          <img src={benefitImagePreview} alt="Benefit Preview" className="w-full h-full object-contain p-1" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-base hover:bg-slate-700 text-xs font-bold text-[#382E42] cursor-pointer transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Benefit Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setBenefitImageFile(file);
                                setBenefitImagePreview(URL.createObjectURL(file));
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 mt-1">Optional secondary schematics image.</p>
                      </div>
                    </div>
                  </div>

                  {/* Catalogue PDF */}
                  <div className="p-4 rounded-xl bg-white border border-[#E8E2EE]">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-2">
                      Product Catalogue Brochure (PDF)
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#574B66]/10 border border-[#574B66]/20 text-[#574B66] flex items-center justify-center shrink-0">
                          <FileDown className="w-5 h-5" />
                        </div>
                        <div>
                          {catalogueFileName ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                {catalogueFile ? catalogueFile.name : 'Brochure Document Attached'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                Ready
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">No PDF brochure attached</span>
                          )}
                          <p className="text-[11px] text-slate-400">Accepted format: PDF (Max 15MB)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentProduct?.catalogue && !catalogueFile && (
                          <button
                            type="button"
                            onClick={() =>
                              setDocViewer({
                                isOpen: true,
                                url: currentProduct.catalogue,
                                title: `${formData.title || 'Product'} — Technical Catalogue Brochure`
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#574B66] text-white text-xs font-bold hover:bg-[#463B53] shadow-sm transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Brochure</span>
                          </button>
                        )}

                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E8E2EE] hover:bg-[#F0ECF4] text-xs font-bold text-[#574B66] cursor-pointer shadow-sm transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{catalogueFileName ? 'Replace PDF' : 'Upload PDF'}</span>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setCatalogueFile(file);
                                setCatalogueFileName(file.name);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: REPEATABLE ADDITIONALS SUB-FORM */}
              {activeTab === 'additionals' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#382E42] uppercase tracking-wider">
                        Additional Specification Blocks
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Add modular specification sections (e.g. Temperature Limits, Pressure Specs, Fuel Flexibility).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addAdditionalRow}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#574B66] hover:bg-[#463B53] text-white text-xs font-bold transition shadow"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Block</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {additionalsList.map((row, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white border border-[#E8E2EE] space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-[#574B66]">
                            Specification Block #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAdditionalRow(idx)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition"
                            title="Remove Block"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={row.title}
                              onChange={(e) => updateAdditionalRow(idx, 'title', e.target.value)}
                              placeholder="Block Title (e.g. Operating Pressure)"
                              className="w-full px-3 py-2 bg-white border border-[#E8E2EE]/80 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              value={row.image}
                              onChange={(e) => updateAdditionalRow(idx, 'image', e.target.value)}
                              placeholder="Image Filename or URL (Optional)"
                              className="w-full px-3 py-2 bg-white border border-[#E8E2EE]/80 rounded-lg text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                            />
                          </div>
                        </div>

                        <div>
                          <textarea
                            rows="2"
                            value={row.description}
                            onChange={(e) => updateAdditionalRow(idx, 'description', e.target.value)}
                            placeholder="Specification details, engineering ranges, formulas..."
                            className="w-full px-3 py-2 bg-white border border-[#E8E2EE]/80 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SEO METADATA */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-[#E8E2EE] space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.seo_title}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        placeholder="e.g. THERMOPAC - High Efficiency Thermic Fluid Heater | Future Techniques"
                        className="w-full px-3.5 py-2 bg-white border border-[#E8E2EE]/80 rounded-lg text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                        SEO Keywords
                      </label>
                      <input
                        type="text"
                        value={formData.seo_keywords}
                        onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                        placeholder="thermic fluid heater, thermax, industrial boiler"
                        className="w-full px-3.5 py-2 bg-white border border-[#E8E2EE]/80 rounded-lg text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows="3"
                        value={formData.seo_description}
                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                        placeholder="Summary description for search engines..."
                        className="w-full px-3.5 py-2 bg-white border border-[#E8E2EE]/80 rounded-lg text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E8E2EE] shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  
                </div>
                <div className="flex items-center gap-3">
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
                      <span>{modalMode === 'create' ? 'Create Product' : 'Save Changes'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#382E42]">Delete Machinery Product?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to delete <span className="text-[#574B66] font-bold">"{productToDelete.title}"</span>?
                This action is permanent and removes the listing from the catalog.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2EE]">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
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

      {/* In-App Technical Catalogue Viewer Modal */}
      <DocumentViewerModal
        isOpen={docViewer.isOpen}
        onClose={() => setDocViewer({ isOpen: false, url: '', title: '' })}
        documentUrl={docViewer.url}
        title={docViewer.title}
      />
    </div>
  );
}
