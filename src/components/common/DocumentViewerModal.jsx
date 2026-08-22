import React from 'react';
import { X, FileText, Download, ExternalLink, Loader2 } from 'lucide-react';

export function DocumentViewerModal({ isOpen, onClose, documentUrl, title = 'Document Viewer' }) {
  if (!isOpen || !documentUrl) return null;

  // Ensure clean and proper document URL without exposing Supabase
  let cleanUrl = documentUrl;
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const apiBase = apiUrl.replace(/\/api\/?$/, '');

  if (cleanUrl.includes('supabase.co') || cleanUrl.includes('/futuretek-media/')) {
    const filename = cleanUrl.split('/').pop();
    cleanUrl = `${apiUrl.replace(/\/$/, '')}/media/document/${filename}`;
  } else if (cleanUrl.startsWith('http://localhost:5000')) {
    cleanUrl = cleanUrl.replace('http://localhost:5000', apiBase);
  } else if (cleanUrl.startsWith('/api') && apiUrl.startsWith('http')) {
    cleanUrl = `${apiBase}${cleanUrl}`;
  }

  const isPdf = cleanUrl.toLowerCase().includes('.pdf');
  const isImage = cleanUrl.toLowerCase().match(/\.(webp|png|jpe?g|svg|gif)$/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[88vh] bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F8F6FA] border-b border-[#E8E2EE] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#574B66]/10 border border-[#574B66]/20 text-[#574B66] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#382E42] truncate max-w-md">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                FTPL Secure Document Viewer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={cleanUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white border border-[#E8E2EE] text-slate-700 hover:text-[#574B66] hover:bg-[#F3EFF6] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              title="Download File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-[#382E42] hover:bg-slate-200/60 transition"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / Preview Area */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
          {isPdf ? (
            <iframe
              src={`${cleanUrl}#toolbar=1&navpanes=0`}
              title={title}
              className="w-full h-full border-0 bg-white"
            />
          ) : isImage ? (
            <div className="p-6 max-h-full max-w-full flex items-center justify-center overflow-auto">
              <img
                src={cleanUrl}
                alt={title}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-md bg-white border border-[#E8E2EE]"
              />
            </div>
          ) : (
            <iframe
              src={cleanUrl}
              title={title}
              className="w-full h-full border-0 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
