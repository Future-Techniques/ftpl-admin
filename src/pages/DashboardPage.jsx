import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FolderTree,
  Package,
  FileText,
  Wrench,
  Factory,
  Building2,
  Mail,
  UserCheck,
  Send,
  HelpCircle,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  TrendingUp,
  Globe,
  Sparkles
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    blogs: 0,
    services: 0,
    industries: 0,
    concerns: 0,
    associates: 0,
    faqs: 0,
    inquiries: 0,
    candidates: 0,
    subscribers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [cats, prods, blogs, services, industries, concerns, associates, faqs, inquiries, candidates, subs] = await Promise.allSettled([
          api.get('/admin/categories'),
          api.get('/admin/products'),
          api.get('/admin/blogs'),
          api.get('/admin/services'),
          api.get('/admin/industries'),
          api.get('/admin/concerns'),
          api.get('/admin/associates'),
          api.get('/admin/faqs'),
          api.get('/admin/contacts'),
          api.get('/admin/candidates'),
          api.get('/admin/subscribers')
        ]);

        setStats({
          categories: cats.status === 'fulfilled' ? (cats.value.data.categories?.length || 0) : 0,
          products: prods.status === 'fulfilled' ? (prods.value.data.products?.length || prods.value.data.data?.length || 0) : 0,
          blogs: blogs.status === 'fulfilled' ? (blogs.value.data.blogs?.length || 0) : 0,
          services: services.status === 'fulfilled' ? (services.value.data.services?.length || 0) : 0,
          industries: industries.status === 'fulfilled' ? (industries.value.data.industries?.length || 0) : 0,
          concerns: concerns.status === 'fulfilled' ? (concerns.value.data.concerns?.length || 0) : 0,
          associates: associates.status === 'fulfilled' ? (associates.value.data.associates?.length || 0) : 0,
          faqs: faqs.status === 'fulfilled' ? (faqs.value.data.types?.reduce((acc, t) => acc + (t.faqs?.length || 0), 0) || faqs.value.data.faqs?.length || 0) : 0,
          inquiries: inquiries.status === 'fulfilled' ? (inquiries.value.data.contacts?.length || inquiries.value.data.data?.length || 0) : 0,
          candidates: candidates.status === 'fulfilled' ? (candidates.value.data.candidates?.length || inquiries.value.data.data?.length || 0) : 0,
          subscribers: subs.status === 'fulfilled' ? (subs.value.data.subscribers?.length || 0) : 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  // Primary Corporate Metrics (Plum and Rose Gold accents)
  const primaryCards = [
    {
      title: 'Products & Machinery',
      count: stats.products,
      path: '/products',
      icon: Package,
      note: 'Industrial equipment & boiler series',
      iconBg: 'bg-[#574B66]/10 text-[#574B66] border border-[#574B66]/20'
    },
    {
      title: 'Product Categories',
      count: stats.categories,
      path: '/categories',
      icon: FolderTree,
      note: 'Classified machinery hierarchy',
      iconBg: 'bg-[#D6969D]/20 text-[#9E4D57] border border-[#D6969D]/40'
    },
    {
      title: 'Articles & Blogs',
      count: stats.blogs,
      path: '/blogs',
      icon: FileText,
      note: 'Technical publications & insights',
      iconBg: 'bg-[#574B66]/10 text-[#574B66] border border-[#574B66]/20'
    },
    {
      title: 'Industrial Services',
      count: stats.services,
      path: '/services',
      icon: Wrench,
      note: 'Engineering & maintenance solutions',
      iconBg: 'bg-[#D6969D]/20 text-[#9E4D57] border border-[#D6969D]/40'
    },
  ];

  // Secondary Leads & Partners
  const secondaryCards = [
    { title: 'Inquiries (Contact)', count: stats.inquiries, path: '/inquiries', icon: Mail, subtitle: 'Direct customer leads' },
    { title: 'Sister Concerns', count: stats.concerns, path: '/sister-concerns', icon: Building2, subtitle: 'Corporate enterprises' },
    { title: 'Global Associates', count: stats.associates, path: '/associates', icon: ShieldCheck, subtitle: 'OEM partners & brands' },
    { title: 'Job Applicants', count: stats.candidates, path: '/candidates', icon: UserCheck, subtitle: 'Talent & resumes' },
    { title: 'Industries Served', count: stats.industries, path: '/industries', icon: Factory, subtitle: 'Manufacturing sectors' },
    { title: 'Subscribers', count: stats.subscribers, path: '/subscribers', icon: Send, subtitle: 'Newsletter audience' },
    { title: 'Active FAQs', count: stats.faqs, path: '/faqs', icon: HelpCircle, subtitle: 'Help & knowledge base' },
  ];

  return (
    <div className="space-y-8">
      {/* Executive Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#574B66]/10 border border-[#574B66]/20 text-[#574B66] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#D6969D]" />
              <span>Future Techniques Pvt. Ltd.</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#382E42] tracking-tight">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">
              Industrial machinery management, corporate network updates, lead oversight, and content publishing platform.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-xs shadow-md shadow-[#574B66]/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#D6969D]" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#574B66] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#D6969D]" />
            <span>Core Industrial Collections</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Real-time database sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {primaryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.path}
                className="group relative overflow-hidden rounded-2xl bg-white hover:bg-[#FAF8FB] border border-[#E8E2EE] hover:border-[#D6969D] p-6 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="p-2 rounded-lg text-slate-400 group-hover:text-[#574B66] group-hover:bg-[#F3EFF6] transition">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-3xl font-extrabold text-[#382E42] tracking-tight font-mono">
                    {loading ? '...' : card.count}
                  </div>
                  <div className="text-sm font-bold text-[#574B66] mt-1">{card.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{card.note}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Secondary Modules Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#574B66] mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#D6969D]" />
          <span>Business Leads & Network Portfolios</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {secondaryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.path}
                className="flex items-center justify-between p-4 rounded-xl bg-white hover:bg-[#FAF8FB] border border-[#E8E2EE] hover:border-[#D6969D] transition group shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE] text-[#574B66] group-hover:text-slate-900 group-hover:bg-[#574B66] transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#382E42] truncate">{card.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{card.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-base font-extrabold text-[#574B66] font-mono">
                    {loading ? '...' : card.count}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#574B66] transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Status Banner */}
      <div className="p-5 rounded-2xl bg-white border border-[#E8E2EE] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#382E42]">System Operational</h4>
            <p className="text-xs text-slate-500 font-medium">
              Connected to FTPL production database with secure authentication.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-[#574B66]/10 hover:bg-[#574B66]/20 text-[#574B66] border border-[#574B66]/20 flex items-center gap-1.5 transition"
          >
            <Globe className="w-3.5 h-3.5 text-[#574B66]" />
            <span>Open Public Website</span>
          </a>
        </div>
      </div>
    </div>
  );
}
