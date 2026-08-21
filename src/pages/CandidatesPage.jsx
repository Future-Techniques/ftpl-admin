import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Users,
  Search,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  FileDown,
  Briefcase,
  Eye,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { DocumentViewerModal } from '../components/common/DocumentViewerModal';

export function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Document Viewer Modal State (In-App PDF View)
  const [docViewer, setDocViewer] = useState({ isOpen: false, url: '', title: '' });

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;

      const res = await api.get('/admin/candidates', { params });
      if (res.data.result === 'success') {
        setCandidates(res.data.candidates);
      }
    } catch (err) {
      showToast('error', 'Failed to load career candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openViewModal = (candidate) => {
    setSelectedCandidate(candidate);
    setIsViewModalOpen(true);
  };

  const handleDelete = async () => {
    if (!candidateToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/admin/candidates/${candidateToDelete.id}`);
      if (res.data.result === 'success') {
        showToast('success', 'Candidate application removed successfully');
        setDeleteModalOpen(false);
        setCandidateToDelete(null);
        fetchCandidates();
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete candidate application');
    } finally {
      setDeleting(false);
    }
  };

  const openResumeViewer = (resumeUrl, name) => {
    setDocViewer({
      isOpen: true,
      url: resumeUrl,
      title: `${name} — Resume & Application`
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#574B66]/10 border border-[#574B66]/20 text-[#574B66] text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#D6969D]" />
              <span>Career & Recruitment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#382E42] tracking-tight">
              Job Candidates & Applications
            </h1>
            <p className="text-xs text-slate-500 max-w-xl font-medium">
              Review applicant resumes, employment history, and contact details submitted from the Careers portal.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E8E2EE] flex items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCandidates()}
            placeholder="Search candidates by name, email, phone, or position..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E2EE] rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#574B66]/20 focus:border-[#574B66] transition font-medium"
          />
        </div>

        <button
          onClick={fetchCandidates}
          className="p-2.5 text-slate-600 hover:text-[#574B66] hover:bg-[#F3EFF6] rounded-xl transition border border-[#E8E2EE]"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-[#E8E2EE] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#F8F6FA] text-[11px] uppercase tracking-wider text-[#574B66] font-bold border-b border-[#E8E2EE]">
              <tr>
                <th className="px-5 py-3.5">Candidate Details</th>
                <th className="px-4 py-3.5">Applied Position</th>
                <th className="px-4 py-3.5">Resume / CV</th>
                <th className="px-4 py-3.5">Applied Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#574B66] mb-3" />
                    <p className="text-sm font-medium">Loading candidate applications...</p>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                    <p className="text-base font-semibold text-[#382E42]">No applications found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Candidate submissions from website career forms will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8FB] transition group">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="font-bold text-[#382E42] text-sm group-hover:text-[#574B66] transition">
                          {c.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {c.email}
                          </span>
                          {c.phone_number && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {c.phone_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#574B66]/10 text-[#574B66] border border-[#574B66]/20">
                        <Briefcase className="w-3 h-3 text-[#D6969D]" />
                        <span>{c.post_name || 'General Application'}</span>
                      </span>
                    </td>

                    {/* Resume In-App Viewer Action */}
                    <td className="px-4 py-4">
                      {c.resume ? (
                        <button
                          type="button"
                          onClick={() => openResumeViewer(c.resume, c.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#574B66]/10 hover:bg-[#574B66] text-[#574B66] hover:text-white border border-[#574B66]/20 text-xs font-bold shadow-sm transition"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>View Resume</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4 font-mono text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(c.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(c)}
                          className="p-2 rounded-lg bg-[#F8F6FA] text-slate-600 hover:text-[#574B66] hover:bg-[#F0ECF4] border border-[#E8E2EE] transition shadow-sm"
                          title="View Full Application"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCandidateToDelete(c);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:text-rose-700 hover:bg-rose-100 border border-rose-200 transition shadow-sm"
                          title="Delete Application"
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

      {/* View Candidate Modal */}
      {isViewModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2EE]">
              <div>
                <h2 className="text-xl font-extrabold text-[#382E42]">
                  {selectedCandidate.name}
                </h2>
                <span className="text-xs text-[#574B66] font-bold">
                  Applied for: {selectedCandidate.post_name || 'General Application'}
                </span>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE]">
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Email Address</span>
                  <a
                    href={`mailto:${selectedCandidate.email}`}
                    className="font-bold text-[#574B66] hover:underline"
                  >
                    {selectedCandidate.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Phone Number</span>
                  <span className="font-bold text-slate-800">
                    {selectedCandidate.phone_number || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Current Address</span>
                  <span className="font-medium text-slate-700">
                    {selectedCandidate.current_address || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold block mb-1">Date of Birth / Gender</span>
                  <span className="font-medium text-slate-700">
                    {selectedCandidate.date_of_birth || 'N/A'} / {selectedCandidate.gender || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Education & Experience */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white border border-[#E8E2EE]">
                  <div className="flex items-center gap-2 mb-2 font-bold text-[#382E42]">
                    <GraduationCap className="w-4 h-4 text-[#574B66]" />
                    <span>Education Background</span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {selectedCandidate.education || 'No educational history provided.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E8E2EE]">
                  <div className="flex items-center gap-2 mb-2 font-bold text-[#382E42]">
                    <Briefcase className="w-4 h-4 text-[#574B66]" />
                    <span>Professional Experience</span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {selectedCandidate.experience || 'No previous experience detailed.'}
                  </p>
                </div>
              </div>

              {/* Remarks */}
              {selectedCandidate.remarks && (
                <div className="p-4 rounded-xl bg-[#F8F6FA] border border-[#E8E2EE]">
                  <span className="text-slate-400 uppercase font-bold block mb-1">Candidate Remarks</span>
                  <p className="text-slate-700 leading-relaxed italic">
                    "{selectedCandidate.remarks}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E8E2EE]">
              {selectedCandidate.resume ? (
                <button
                  type="button"
                  onClick={() => openResumeViewer(selectedCandidate.resume, selectedCandidate.name)}
                  className="px-4 py-2.5 rounded-xl bg-[#574B66] hover:bg-[#463B53] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>View Resume PDF</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400">No PDF attached</span>
              )}

              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-[#F8F6FA] transition rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && candidateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#E8E2EE] rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#382E42]">Remove Candidate Application</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete the job application from{' '}
                <span className="text-[#574B66] font-bold">"{candidateToDelete.name}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E8E2EE] text-xs font-semibold text-slate-600 hover:bg-[#F8F6FA] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App PDF / Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={docViewer.isOpen}
        onClose={() => setDocViewer({ isOpen: false, url: '', title: '' })}
        documentUrl={docViewer.url}
        title={docViewer.title}
      />
    </div>
  );
}
