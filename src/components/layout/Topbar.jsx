import React from 'react';
import {
  Menu,
  LogOut,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const routeTitles = {
  '/': 'Dashboard Overview',
  '/categories': 'Product Categories',
  '/products': 'Industrial Machinery & Products',
  '/blogs': 'Articles & Technical Blogs',
  '/services': 'Services & Capabilities',
  '/industries': 'Industry Sectors',
  '/sister-concerns': 'Sister Concerns & Group Enterprises',
  '/associates': 'Associates & Global Partners',
  '/banners': 'Hero Banners & Visual Media',
  '/features': 'Core Enterprise Features',
  '/pages': 'Static Pages & Corporate Content',
  '/faqs': 'Frequently Asked Questions',
  '/inquiries': 'Customer Inquiries & Leads',
  '/candidates': 'Career Applicants & Candidates',
  '/subscribers': 'Newsletter Subscribers',
  '/cleanup': 'Data Cleanup & Test Record Manager',
};

export function Topbar({ setMobileOpen }) {
  const { logout } = useAuth();
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || 'Management Portal';

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E2EE] px-4 sm:px-6 flex items-center justify-between transition-colors shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button (Only visible on mobile screens < 1024px) */}
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] border border-transparent hover:border-[#E8E2EE] lg:hidden transition"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Section Title */}
        <div className="flex items-center gap-2.5">
          <div className="h-4 w-1.5 rounded-full bg-[#574B66]" />
          <h2 className="text-sm sm:text-base font-bold text-[#382E42] tracking-tight truncate max-w-[200px] sm:max-w-none">
            {currentTitle}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* View live public site */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#574B66] bg-[#574B66]/10 hover:bg-[#574B66]/15 border border-[#574B66]/25 rounded-xl transition shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-[#574B66]" />
          <span>Live Website</span>
          <ExternalLink className="w-3 h-3 text-[#D6969D]" />
        </a>

        {/* User Info Capsule: FTPL Admin */}
        <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE] text-xs">
          <div className="w-6 h-6 rounded-lg bg-[#574B66] flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
            F
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#382E42] leading-tight">
              FTPL Admin
            </span>
            <span className="text-[10px] text-[#574B66] font-semibold uppercase">
              Super Admin
            </span>
          </div>
        </div>

        {/* Logout Action */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#C47983] hover:text-white bg-[#FDF8F9] hover:bg-[#C47983] border border-[#D6969D]/30 transition shadow-sm active:scale-95"
          title="Sign out of portal"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
