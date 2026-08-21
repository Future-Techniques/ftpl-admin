import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  FileText,
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
  Eye,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export function BlogsPage() {
  const [activeTab, setActiveTab] = useState('blogs'); // 'blogs' | 'categories'
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Blog Modal State
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [blogModalMode, setBlogModalMode] = useState('create');
  const [currentBlog, setCurrentBlog] = useState(null);
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    summary: '',
    description: '',
    status: 1,
    seo_title: '',
    seo_keyword: '',
    seo_description: '',
  });
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [blogImagePreview, setBlogImagePreview] = useState(null);

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catModalMode, setCatModalMode] = useState('create');
  const [currentCat, setCurrentCat] = useState(null);
  const [catFormData, setCatFormData] = useState({
    title: '',
    slug: '',
    description: '',
    status: 1,
    seo_title: '',
    seo_keyword: '',
    seo_description: '',
  });
  const [catImageFile, setCatImageFile] = useState(null);
  const [catImagePreview, setCatImagePreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('blog'); // 'blog' | 'category'
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, blogsRes] = await Promise.all([
        api.get('/admin/blogs/categories'),
        api.get('/admin/blogs', {
          params: {
            search: search || undefined,
            category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
          },
        }),
      ]);

      if (catsRes.data.result === 'success') {
        setCategories(catsRes.data.categories);
      }
      if (blogsRes.data.result === 'success') {
        setBlogs(blogsRes.data.blogs);
      }
    } catch (err) {
      showToast('error', 'Failed to load blog data');
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

  // Blog modal handlers
  const openCreateBlogModal = () => {
    setBlogModalMode('create');
    setCurrentBlog(null);
    setBlogFormData({
      title: '',
      slug: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      summary: '',
      description: '',
      status: 1,
      seo_title: '',
      seo_keyword: '',
      seo_description: '',
    });
    setBlogImageFile(null);
    setBlogImagePreview(null);
    setBlogModalOpen(true);
  };

  const openEditBlogModal = (blog) => {
    setBlogModalMode('edit');
    setCurrentBlog(blog);
    setBlogFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      category_id: blog.category_id ? String(blog.category_id) : '',
      summary: blog.summary || '',
      description: blog.description || '',
      status: blog.status ?? 1,
      seo_title: blog.seo_title || '',
      seo_keyword: blog.seo_keyword || '',
      seo_description: blog.seo_description || '',
    });
    setBlogImageFile(null);
    setBlogImagePreview(blog.image || null);
    setBlogModalOpen(true);
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogFormData.title.trim()) {
      showToast('error', 'Article title is required');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', blogFormData.title.trim());
      if (blogFormData.slug) data.append('slug', blogFormData.slug.trim());
      if (blogFormData.category_id) data.append('category_id', blogFormData.category_id);
      data.append('summary', blogFormData.summary || '');
      data.append('description', blogFormData.description || '');
      data.append('status', blogFormData.status);
      data.append('seo_title', blogFormData.seo_title || '');
      data.append('seo_keyword', blogFormData.seo_keyword || '');
      data.append('seo_description', blogFormData.seo_description || '');

      if (blogImageFile) {
        data.append('image', blogImageFile);
      }

      if (blogModalMode === 'create') {
        const res = await api.post('/admin/blogs', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Blog article published successfully');
          setBlogModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/admin/blogs/${currentBlog.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Blog article updated successfully');
          setBlogModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Category modal handlers
  const openCreateCatModal = () => {
    setCatModalMode('create');
    setCurrentCat(null);
    setCatFormData({
      title: '',
      slug: '',
      description: '',
      status: 1,
      seo_title: '',
      seo_keyword: '',
      seo_description: '',
    });
    setCatImageFile(null);
    setCatImagePreview(null);
    setCatModalOpen(true);
  };

  const openEditCatModal = (cat) => {
    setCatModalMode('edit');
    setCurrentCat(cat);
    setCatFormData({
      title: cat.title || '',
      slug: cat.slug || '',
      description: cat.description || '',
      status: cat.status ?? 1,
      seo_title: cat.seo_title || '',
      seo_keyword: cat.seo_keyword || '',
      seo_description: cat.seo_description || '',
    });
    setCatImageFile(null);
    setCatImagePreview(cat.image || null);
    setCatModalOpen(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catFormData.title.trim()) {
      showToast('error', 'Category title is required');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', catFormData.title.trim());
      if (catFormData.slug) data.append('slug', catFormData.slug.trim());
      data.append('description', catFormData.description || '');
      data.append('status', catFormData.status);
      data.append('seo_title', catFormData.seo_title || '');
      data.append('seo_keyword', catFormData.seo_keyword || '');
      data.append('seo_description', catFormData.seo_description || '');

      if (catImageFile) {
        data.append('image', catImageFile);
      }

      if (catModalMode === 'create') {
        const res = await api.post('/admin/blogs/categories', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Blog category created successfully');
          setCatModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.put(`/admin/blogs/categories/${currentCat.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.result === 'success') {
          showToast('success', 'Blog category updated successfully');
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

  const handleToggleBlogStatus = async (blog) => {
    try {
      const res = await api.patch(`/admin/blogs/${blog.id}/status`);
      if (res.data.result === 'success') {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, status: res.data.status } : b))
        );
        showToast('success', `Article ${res.data.status === 1 ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      showToast('error', 'Failed to toggle status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      if (deleteType === 'blog') {
        const res = await api.delete(`/admin/blogs/${itemToDelete.id}`);
        if (res.data.result === 'success') {
          showToast('success', 'Blog article deleted successfully');
        }
      } else {
        const res = await api.delete(`/admin/blogs/categories/${itemToDelete.id}`);
        if (res.data.result === 'success') {
          showToast('success', 'Blog category deleted successfully');
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#382E42] tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-[#574B66]" />
            <span>Articles & Technical Blogs</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Publish engineering whitepapers, product news, and industrial knowledge base articles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'blogs' ? (
            <button
              onClick={openCreateBlogModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Article</span>
            </button>
          ) : (
            <button
              onClick={openCreateCatModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Blog Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-[#E8E2EE] pb-3">
        <button
          onClick={() => setActiveTab('blogs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'blogs'
              ? 'bg-[#574B66] text-white shadow-md shadow-brand-600/25'
              : 'text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6]/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Articles ({blogs.length})</span>
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
          <span>Blog Categories ({categories.length})</span>
        </button>
      </div>

      {/* TAB A: BLOGS / ARTICLES */}
      {activeTab === 'blogs' && (
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
                placeholder="Search articles by title or summary..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8F6FA] border border-[#E8E2EE]/60 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition"
              />
            </div>

            <div className="flex items-center gap-3">
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

              <button
                onClick={fetchData}
                className="p-2 text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] rounded-xl transition"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Blogs Data Table */}
          <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
                  <tr>
                    <th className="px-5 py-3.5">Article Title</th>
                    <th className="px-4 py-3.5">Topic Category</th>
                    <th className="px-4 py-3.5">Publish Date</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#574B66] mb-3" />
                        <p className="text-sm font-medium">Fetching articles ...</p>
                      </td>
                    </tr>
                  ) : blogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                        <p className="text-base font-semibold text-slate-600">No articles found</p>
                      </td>
                    </tr>
                  ) : (
                    blogs.map((b) => (
                      <tr key={b.id} className="hover:bg-brand-50/40 transition group">
                        {/* Title & Cover */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-12 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                              {b.image ? (
                                <img
                                  src={b.image}
                                  alt={b.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-700" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[#382E42] text-sm group-hover:text-[#574B66] transition truncate max-w-md">
                                {b.title}
                              </p>
                              <p className="text-xs text-slate-600 truncate max-w-md mt-0.5">
                                {b.summary || 'No summary provided'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#574B66]/10 text-[#574B66] border border-[#574B66]/20 font-bold">
                            {b.category_title}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 text-xs font-mono text-slate-600">
                          {b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleToggleBlogStatus(b)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              b.status === 1
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-surface-base text-slate-400 border border-[#E8E2EE] hover:bg-slate-700 hover:text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.status === 1 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                              }`}
                            />
                            <span>{b.status === 1 ? 'Published' : 'Draft'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditBlogModal(b)}
                              className="p-2 rounded-lg text-slate-600 hover:text-[#574B66] hover:bg-brand-50/40 transition"
                              title="Edit Article"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(b);
                                setDeleteType('blog');
                                setDeleteModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-950/40 transition"
                              title="Delete Article"
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

      {/* TAB B: BLOG CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-[#E8E2EE]">
                  <tr>
                    <th className="px-5 py-3.5">Category Name</th>
                    <th className="px-4 py-3.5">URL Slug</th>
                    <th className="px-4 py-3.5 text-center">Associated Articles</th>
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
                          {c.blog_count} Articles
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

      {/* Create / Edit Blog Modal */}
      {blogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#382E42]">
                  {blogModalMode === 'create' ? 'Publish New Technical Article' : 'Edit Technical Article'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Compose content, upload featured cover image, and configure SEO metadata.
                </p>
              </div>
              <button
                onClick={() => setBlogModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBlogSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={blogFormData.title}
                    onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                    placeholder="e.g. Advancements in Condensing Economizers"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                    Topic Category *
                  </label>
                  <select
                    required
                    value={blogFormData.category_id}
                    onChange={(e) => setBlogFormData({ ...blogFormData, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={blogFormData.slug}
                  onChange={(e) => setBlogFormData({ ...blogFormData, slug: e.target.value })}
                  placeholder="e.g. advancements-in-condensing-economizers"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Featured Cover Image (Media Storage)
                </label>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#E8E2EE]">
                  <div className="w-24 h-16 rounded-xl bg-white border border-[#E8E2EE] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {blogImagePreview ? (
                      <img src={blogImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-base hover:bg-slate-700 text-xs font-bold text-[#382E42] cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Cover Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setBlogImageFile(file);
                            setBlogImagePreview(URL.createObjectURL(file));
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

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Executive Summary / Excerpt
                </label>
                <textarea
                  rows="2"
                  value={blogFormData.summary}
                  onChange={(e) => setBlogFormData({ ...blogFormData, summary: e.target.value })}
                  placeholder="Short introductory teaser for article listings..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              {/* Main Content */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#574B66] mb-1.5">
                  Full Article Body (HTML / Markdown)
                </label>
                <textarea
                  rows="6"
                  value={blogFormData.description}
                  onChange={(e) => setBlogFormData({ ...blogFormData, description: e.target.value })}
                  placeholder="Compose article paragraphs, technical breakdowns, lists..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={blogFormData.status === 1}
                    onChange={(e) => setBlogFormData({ ...blogFormData, status: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-[#574B66] bg-surface-base border-[#E8E2EE] focus:ring-[#574B66]/20 focus:border-[#574B66]"
                  />
                  <span>Published Live on Public Site</span>
                </label>
              </div>

              {/* SEO Box */}
              <div className="p-4 rounded-xl bg-white border border-[#E8E2EE] space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">SEO Metadata</p>
                <input
                  type="text"
                  value={blogFormData.seo_title}
                  onChange={(e) => setBlogFormData({ ...blogFormData, seo_title: e.target.value })}
                  placeholder="SEO Title"
                  className="w-full px-3 py-2 bg-white border border-[#E8E2EE]/60 rounded-lg text-xs text-slate-900"
                />
                <input
                  type="text"
                  value={blogFormData.seo_keyword}
                  onChange={(e) => setBlogFormData({ ...blogFormData, seo_keyword: e.target.value })}
                  placeholder="SEO Keywords"
                  className="w-full px-3 py-2 bg-white border border-[#E8E2EE]/60 rounded-lg text-xs text-slate-900"
                />
                <textarea
                  rows="2"
                  value={blogFormData.seo_description}
                  onChange={(e) => setBlogFormData({ ...blogFormData, seo_description: e.target.value })}
                  placeholder="SEO Description"
                  className="w-full px-3 py-2 bg-white border border-[#E8E2EE]/60 rounded-lg text-xs text-slate-900"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2EE]">
                <button
                  type="button"
                  onClick={() => setBlogModalOpen(false)}
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
                      <span>Publishing to Supabase...</span>
                    </>
                  ) : (
                    <span>{blogModalMode === 'create' ? 'Publish Article' : 'Save Changes'}</span>
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
          <div className="relative w-full max-w-lg bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE] mb-6">
              <h2 className="text-lg font-extrabold text-[#382E42]">
                {catModalMode === 'create' ? 'Create Blog Category' : 'Edit Blog Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catFormData.title}
                  onChange={(e) => setCatFormData({ ...catFormData, title: e.target.value })}
                  placeholder="e.g. Technical Guides"
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
                  placeholder="e.g. technical-guides"
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
                  placeholder="Overview of articles under this category..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2EE]">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
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
                Delete {deleteType === 'blog' ? 'Article' : 'Blog Category'}?
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
    </div>
  );
}
