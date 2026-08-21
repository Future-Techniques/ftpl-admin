import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  FileText,
  Wrench,
  Factory,
  Building2,
  Image,
  Sparkles,
  Layers,
  HelpCircle,
  Mail,
  UserCheck,
  Send,
  Trash2,
  ShieldCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigationGroups = [
  {
    title: 'Core Management',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Categories', path: '/categories', icon: FolderTree },
      { name: 'Products', path: '/products', icon: Package },
      { name: 'Articles & Blogs', path: '/blogs', icon: FileText },
    ]
  },
  {
    title: 'Business & Solutions',
    items: [
      { name: 'Services', path: '/services', icon: Wrench },
      { name: 'Industries', path: '/industries', icon: Factory },
      { name: 'Sister Concerns', path: '/sister-concerns', icon: Building2 },
      { name: 'Associates & Partners', path: '/associates', icon: ShieldCheck },
    ]
  },
  {
    title: 'Content & Media',
    items: [
      { name: 'Hero Banners', path: '/banners', icon: Image },
      { name: 'Core Features', path: '/features', icon: Sparkles },
      { name: 'Static Pages', path: '/pages', icon: Layers },
      { name: 'FAQs', path: '/faqs', icon: HelpCircle },
    ]
  },
  {
    title: 'Leads & Applications',
    items: [
      { name: 'Inquiries (Contact)', path: '/inquiries', icon: Mail },
      { name: 'Job Candidates', path: '/candidates', icon: UserCheck },
      { name: 'Subscribers', path: '/subscribers', icon: Send },
    ]
  },
  {
    title: 'System & Tools',
    items: [
      { name: 'Data Cleanup Suite', path: '/cleanup', icon: Trash2 },
    ]
  }
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#574B66] text-white shadow-2xl transition-transform duration-300 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-[#6B5D7C] bg-[#483D54]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <img
                src="/logo-white.png"
                alt="FTPL"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white">
                FTPL Admin
              </span>
              <span className="text-[11px] text-[#D6969D] font-semibold tracking-wider uppercase">
                Control Panel
              </span>
            </div>
          </div>

          {/* Close button on Mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-[#D6969D] hover:text-white hover:bg-white/10 lg:hidden transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#D6969D] mb-1.5">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                          isActive
                            ? 'bg-[#43384E] text-white shadow-sm border-l-4 border-[#D6969D] font-bold'
                            : 'text-[#E8E1EF] hover:text-white hover:bg-[#68597B]'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-[#D6969D]" />
                      <span className="truncate flex-1">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer / User card */}
        <div className="p-3 border-t border-[#6B5D7C] bg-[#483D54]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 border border-white/15">
            <div className="w-8 h-8 rounded-lg bg-[#D6969D] text-[#483D54] flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              F
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">FTPL Admin</p>
              <p className="text-[10px] text-[#D6969D] truncate uppercase font-mono tracking-wider">
                SUPER ADMIN
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
