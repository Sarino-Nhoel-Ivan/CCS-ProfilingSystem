import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { STORAGE_URL } from '../../utils/config';
import AddFacultyModal from './AddFacultyModal';
import EditFacultyModal from './EditFacultyModal';
import DeleteFacultyModal from './DeleteFacultyModal';
import FacultyProfileTabs from './FacultyProfileTabs';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  UsersIcon, CheckCircleIcon, ClockIcon,
  MagnifyingGlassIcon, PlusIcon, ArrowUpTrayIcon,
  ChevronRightIcon, BuildingOfficeIcon, EnvelopeIcon,
  Squares2X2Icon, TableCellsIcon, ListBulletIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => (v == null || v === '' ? 'N/A' : String(v));
const fmtDate = (d) => {
  if (!d) return 'N/A';
  try { return new Date(d.replace ? d.replace(' ', 'T') : d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return d; }
};

// ── Faculty Avatar ─────────────────────────────────────────────────────────
const FacultyAvatar = ({ faculty: f, size = 'md', dark }) => {
  const [imgError, setImgError] = useState(false);
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-11 h-11 text-sm' : 'w-9 h-9 text-sm';
  const initials = `${f.first_name?.[0] ?? ''}${f.last_name?.[0] ?? ''}`;
  const photoSrc = f.profile_photo
    ? (f.profile_photo.startsWith('http') ? f.profile_photo : `${STORAGE_URL}/${f.profile_photo}`)
    : null;
  if (photoSrc && !imgError)
    return <img src={photoSrc} alt={initials} className={`${sz} rounded-full object-cover shrink-0`} onError={() => setImgError(true)} />;
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
};

// ── Faculty Export (PDF + XLSX) ────────────────────────────────────────────
const exportFacultyPDF = async (faculties) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const orange = [242, 101, 34];
  const W = doc.internal.pageSize.getWidth();

  doc.setFillColor(...orange);
  doc.rect(0, 0, W, 26, 'F');

  // CCS Logo centered
  try {
    const logoImg = await fetch('/ccs_logo.jpg').then(r => r.blob()).then(b => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(b);
    }));
    doc.addImage(logoImg, 'JPEG', (W - 12) / 2, 3, 12, 12);
  } catch (e) { console.warn('Logo not loaded:', e); }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text('CCS Profiling System — Faculty Report', W / 2, 18, { align: 'center' });
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text(`Pamantasan ng Cabuyao  ·  Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  ·  Total: ${faculties.length} faculty`, W / 2, 23, { align: 'center' });

  autoTable(doc, {
    startY: 30,
    margin: { left: 10, right: 10 },
    head: [['#', 'Full Name', 'Position', 'Department', 'Status', 'Email', 'Contact', 'Date Hired']],
    body: faculties.map((f, i) => [
      i + 1,
      `${f.first_name} ${f.middle_name ? f.middle_name[0] + '. ' : ''}${f.last_name}`,
      fmt(f.position),
      fmt(f.department?.department_name),
      fmt(f.employment_status),
      fmt(f.email),
      fmt(f.contact_number),
      fmtDate(f.hire_date),
    ]),
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: orange, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount}  ·  CCS Profiling System`, W / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
  }

  doc.save(`faculty_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

const exportFacultyXLSX = async (faculties) => {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const hdrStyle = {
    fill: { fgColor: { rgb: 'F26522' }, patternType: 'solid' },
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  const headers = ['#', 'First Name', 'Middle Name', 'Last Name', 'Position', 'Department',
    'Employment Status', 'Email', 'Contact Number', 'Office Location', 'Date Hired'];

  const rows = faculties.map((f, i) => [
    i + 1, fmt(f.first_name), fmt(f.middle_name), fmt(f.last_name),
    fmt(f.position), fmt(f.department?.department_name),
    fmt(f.employment_status), fmt(f.email), fmt(f.contact_number),
    fmt(f.office_location), fmtDate(f.hire_date),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [4, 14, 14, 14, 22, 22, 16, 30, 15, 20, 16].map(w => ({ wch: w }));
  ws['!rows'] = [{ hpt: 20 }];
  headers.forEach((_, ci) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c: ci });
    if (!ws[addr]) ws[addr] = {};
    ws[addr].s = hdrStyle;
  });
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  XLSX.utils.book_append_sheet(wb, ws, 'Faculty List');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `faculty_report_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

// ── Faculty Export Modal ───────────────────────────────────────────────────
const FacultyExportModal = ({ isOpen, onClose, faculties }) => {
  const dark = useDarkMode();
  const [exportType, setExportType] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const modalBg  = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'border-slate-700/60' : 'border-slate-100';
  const footerBg = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!exportType) return;
    setIsExporting(true);
    try {
      if (exportType === 'pdf') await exportFacultyPDF(faculties);
      else if (exportType === 'xlsx') await exportFacultyXLSX(faculties);
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const options = [
    {
      id: 'pdf',
      title: 'All Faculty — PDF',
      desc: `Export a summary table of all ${faculties.length} faculty members as a PDF document.`,
      badge: 'PDF',
      badgeCls: dark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-700',
      iconBg: dark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-500',
    },
    {
      id: 'xlsx',
      title: 'All Faculty — XLSX',
      desc: `Export all ${faculties.length} faculty members as a styled Excel spreadsheet.`,
      badge: 'XLSX',
      badgeCls: dark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700',
      iconBg: dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-500',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${modalBg}`}>
          <div className={`flex items-center justify-between px-6 py-5 border-b ${divider} ${dark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-orange-50/60 to-white'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
                <ArrowUpTrayIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`text-base font-bold ${boldText}`}>Export Faculty Report</h2>
                <p className={`text-xs ${subText}`}>Choose the format for your export.</p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5 space-y-3">
            {options.map(opt => (
              <button key={opt.id} onClick={() => setExportType(opt.id)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                  exportType === opt.id
                    ? (dark ? 'border-orange-500/60 bg-orange-900/20 ring-1 ring-orange-500/40' : 'border-orange-400 bg-orange-50 ring-1 ring-orange-400/30')
                    : (dark ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/60' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${opt.iconBg}`}>
                  <ArrowUpTrayIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-bold ${boldText}`}>{opt.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.badgeCls}`}>{opt.badge}</span>
                  </div>
                  <p className={`text-xs leading-relaxed ${subText}`}>{opt.desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-colors ${
                  exportType === opt.id ? 'border-orange-500 bg-orange-500' : (dark ? 'border-slate-600' : 'border-slate-300')
                }`}>
                  {exportType === opt.id && <div className="w-full h-full rounded-full bg-white scale-50 block" />}
                </div>
              </button>
            ))}
          </div>
          <div className={`px-5 py-4 flex justify-end gap-3 border-t ${footerBg}`}>
            <button onClick={onClose} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${dark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}>
              Cancel
            </button>
            <button onClick={handleExport} disabled={!exportType || isExporting}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-40 flex items-center gap-2 min-w-[130px] justify-center">
              {isExporting
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Exporting...</>
                : <><ArrowUpTrayIcon className="w-4 h-4" />Export</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Faculty Card (cards view) ──────────────────────────────────────────────
const FacultyCard = ({ faculty: f, onSelect, onEdit, onDelete, dark }) => {
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const labelText = dark ? 'text-slate-400' : 'text-slate-500';
  return (
    <div onClick={() => onSelect(f)}
      className={`group relative rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl overflow-hidden
        ${dark ? 'bg-slate-800 border-slate-700 hover:border-orange-500/50 hover:shadow-orange-500/10'
               : 'bg-white border-slate-200 hover:border-orange-400/60 hover:shadow-orange-500/10'}`}>
      <div className={`h-1 w-full ${f.employment_status === 'Full-Time' ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <FacultyAvatar faculty={f} size="lg" dark={dark} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate leading-tight ${boldText}`}>{f.first_name} {f.last_name}</p>
            <p className={`text-xs mt-0.5 truncate ${labelText}`}>{f.position || 'N/A'}</p>
          </div>
          <ChevronRightIcon className={`w-4 h-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
        </div>
        <div className={`space-y-1.5 text-xs border-t pt-3 ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className={`flex items-center gap-1.5 ${labelText}`}>
            <BuildingOfficeIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{f.department?.department_name || 'No department'}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${labelText}`}>
            <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{f.email || 'N/A'}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={() => { onEdit(f); }}
              className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onClick={() => { onDelete(f.id); }}
              className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
          {f.employment_status === 'Full-Time'
            ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Full-Time
              </span>
            : <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{f.employment_status}</span>}
        </div>
      </div>
    </div>
  );
};

// ── Main Module ────────────────────────────────────────────────────────────
const FacultyModule = ({ faculties: propFaculties = [], loading: propLoading = false, onReload }) => {
  const dark = useDarkMode();
  const navigate = useNavigate();
  const { id: routeId } = useParams();

  const card      = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const labelText = dark ? 'text-slate-400' : 'text-slate-500';
  const divider   = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const rowHover  = dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const tabBar    = dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const inputCls  = dark
    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-orange-400'
    : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-orange-400';

  const faculties  = propFaculties;
  const isLoading  = propLoading;
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    api.schedules.getAll().then(setSchedules).catch(() => {});
  }, []);
  const stats = {
    total:    faculties.length,
    fullTime: faculties.filter(f => f.employment_status === 'Full-Time').length,
    partTime: faculties.filter(f => f.employment_status !== 'Full-Time').length,
  };
  const [activeTab, setActiveTab]   = useState('overview');
  const [viewMode, setViewMode]     = useState('list');
  const [listSearch, setListSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);

  // Reset pagination when search/filter/view changes
  useEffect(() => { setVisibleCount(50); }, [listSearch, statusFilter, viewMode]);

  const tabs = [
    { id: 'overview',         label: 'Overview' },
    { id: 'personal_details', label: 'Personal Details' },
    { id: 'subjects',         label: 'Subjects' },
  ];

  const reloadFaculties = async () => { if (onReload) await onReload(); };

  useEffect(() => {
    if (routeId) {
      api.faculties.get(routeId)
        .then(f => { setSelectedFaculty(f); setActiveTab('personal_details'); })
        .catch(() => {});
    }
  }, []); // eslint-disable-line

  const handleFacultyClick = (f) => {
    setSelectedFaculty(f);
    setActiveTab('personal_details');
    navigate(`/admin/reports/${f.id}`, { replace: true });
  };

  const handleEditFaculty   = (f) => { setSelectedFaculty(f || selectedFaculty); setIsEditModalOpen(true); };
  const handleDeleteFaculty = (id) => { setFacultyToDelete(id); setIsDeleteModalOpen(true); };

  const confirmDeleteFaculty = async () => {
    try {
      await api.faculties.delete(facultyToDelete);
      await reloadFaculties();
      setIsDeleteModalOpen(false);
      setSelectedFaculty(null);
      setActiveTab('overview');
      navigate('/admin/reports', { replace: true });
      setFacultyToDelete(null);
    } catch {
      alert('Failed to delete faculty. Please try again.');
    }
  };

  const fullTimePct = stats.total ? Math.round((stats.fullTime / stats.total) * 100) : 0;

  const filtered = faculties.filter(f => {
    const matchSearch = !listSearch ||
      `${f.first_name} ${f.last_name} ${f.email || ''} ${f.position || ''}`.toLowerCase().includes(listSearch.toLowerCase());
    const matchStatus = statusFilter === 'All' || f.employment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col h-full w-full space-y-5">

      {/* ── Hero Header ── */}
      <div className={`relative rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-400/5 pointer-events-none rounded-2xl" />
        <div className="relative p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
              <UsersIcon className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>CCS Profiling System</p>
              <h1 className={`text-xl font-extrabold tracking-tight ${boldText}`}>Faculty Management</h1>
              <p className={`text-xs mt-0.5 ${labelText}`}>Manage faculty directory, employment details, and department assignments.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className={`flex items-center gap-2 pr-3 border-r ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={dark ? '#1e293b' : '#f1f5f9'} strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f97316" strokeWidth="3.5"
                    strokeDasharray={`${fullTimePct} ${100 - fullTimePct}`} strokeLinecap="round" />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-extrabold ${boldText}`}>{fullTimePct}%</span>
              </div>
              <div className="hidden sm:block">
                <p className={`text-[11px] font-semibold ${labelText}`}>Full-Time Rate</p>
                <p className={`text-sm font-bold ${boldText}`}>{stats.fullTime} / {stats.total}</p>
              </div>
            </div>
            <button onClick={() => setIsExportModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 font-semibold text-xs rounded-xl transition-colors border ${dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}>
              <ArrowUpTrayIcon className="w-3.5 h-3.5" />Export
            </button>
            <button onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-orange-500/30">
              <PlusIcon className="w-3.5 h-3.5" />Add Faculty
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Faculty', value: stats.total,    icon: UsersIcon,       accent: 'border-l-orange-500', iconBg: dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500' },
          { label: 'Full-Time',     value: stats.fullTime, icon: CheckCircleIcon, accent: 'border-l-green-500',  iconBg: dark ? 'bg-green-900/40 text-green-400'  : 'bg-green-50 text-green-500'  },
          { label: 'Part-Time',     value: stats.partTime, icon: ClockIcon,       accent: 'border-l-slate-400',  iconBg: dark ? 'bg-slate-800 text-slate-500'     : 'bg-slate-100 text-slate-400' },
        ].map(({ label, value, icon: Icon, accent, iconBg }) => (
          <div key={label} className={`p-5 rounded-2xl border-l-4 border shadow-sm flex items-center gap-4 transition-colors duration-300 ${accent} ${card}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}><Icon className="w-6 h-6" /></div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${labelText}`}>{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${boldText}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Card ── */}
      <div className={`rounded-2xl shadow-sm border transition-colors duration-300 ${card}`}>

        {/* Tabs */}
        <div className={`flex border-b px-6 pt-2 transition-colors duration-300 ${tabBar}`}>
          {tabs.filter(tab => selectedFaculty || tab.id === 'overview').map(tab => (
            <button key={tab.id}
              onClick={() => {
                if (tab.id === 'overview') { setSelectedFaculty(null); navigate('/admin/reports', { replace: true }); }
                setActiveTab(tab.id);
              }}
              className={`px-5 py-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-orange-500'
                  : dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 rounded-t-lg'
                         : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'}`}>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-t shadow-[0_-2px_8px_rgba(249,115,22,0.4)]" />
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={`rounded-xl m-5 border transition-colors duration-300 ${card}`}>

            {/* List header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-1 h-5 rounded-full ${dark ? 'bg-orange-400' : 'bg-orange-500'}`} />
                <h3 className={`text-base font-bold ${boldText}`}>Faculty Directory</h3>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                  dark
                    ? 'bg-orange-900/20 border-orange-800/40 text-orange-300'
                    : 'bg-orange-50 border-orange-100 text-orange-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-orange-400' : 'bg-orange-500'}`} />
                  {faculties.length} total
                </span>
              </div>
              {/* View toggle */}
              <div className={`flex rounded-lg border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                {[
                  { id: 'cards', icon: <Squares2X2Icon className="w-3.5 h-3.5" /> },
                  { id: 'table', icon: <TableCellsIcon className="w-3.5 h-3.5" /> },
                  { id: 'list',  icon: <ListBulletIcon className="w-3.5 h-3.5" /> },
                ].map(v => (
                  <button key={v.id} onClick={() => setViewMode(v.id)}
                    className={`px-2.5 py-1.5 transition-colors ${viewMode === v.id
                      ? 'bg-orange-500 text-white'
                      : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                    {v.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Search + filter */}
            <div className={`flex gap-3 px-5 py-3 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
              <div className="relative flex-1">
                <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Search name, position, or email..."
                  className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`} />
                {listSearch && (
                  <button onClick={() => setListSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <XMarkIcon className={`w-4 h-4 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} />
                  </button>
                )}
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className={`rounded-xl border text-sm px-3 py-2.5 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200 focus:border-orange-400' : 'bg-white border-slate-200 text-slate-700 focus:border-orange-400'}`}>
                <option value="All">All Status</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Adjunct">Adjunct</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            {/* Results */}
            <div className="p-5">
              {isLoading ? (
                <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>
              ) : faculties.length === 0 ? (
                <div className={`py-12 flex flex-col items-center justify-center text-center ${labelText}`}>
                  <UsersIcon className="w-10 h-10 mb-3 opacity-30" />
                  <p className="font-semibold">No faculty members yet</p>
                  <p className="text-xs mt-1 opacity-70">Click "Add Faculty" to get started</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className={`py-12 flex flex-col items-center justify-center text-center ${labelText}`}>
                  <MagnifyingGlassIcon className="w-10 h-10 mb-3 opacity-30" />
                  <p className="font-semibold">No faculty match your search</p>
                  <p className="text-xs mt-1 opacity-70">Try adjusting your filters</p>
                </div>
              ) : (() => {
                const page    = filtered.slice(0, visibleCount);
                const hasMore = filtered.length > visibleCount;

                const LoadMore = () => hasMore ? (
                  <div className="pt-4 flex flex-col items-center gap-1">
                    <button onClick={() => setVisibleCount(v => v + 50)}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-colors ${dark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}>
                      Load more ({filtered.length - visibleCount} remaining)
                    </button>
                    <p className={`text-xs ${labelText}`}>Showing {visibleCount} of {filtered.length}</p>
                  </div>
                ) : filtered.length > 50 ? (
                  <p className={`pt-3 text-center text-xs ${labelText}`}>All {filtered.length} faculty shown</p>
                ) : null;

                if (viewMode === 'cards') return (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {page.map(f => <FacultyCard key={f.id} faculty={f} onSelect={handleFacultyClick} onEdit={handleEditFaculty} onDelete={handleDeleteFaculty} dark={dark} />)}
                    </div>
                    <LoadMore />
                  </div>
                );

                if (viewMode === 'table') return (
                  <div>
                    <div className={`overflow-x-auto rounded-xl border ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
                      <table className="w-full text-sm">
                        <thead className={`text-xs uppercase tracking-wider ${dark ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                          <tr>
                            <th className="px-4 py-3 text-left font-bold">Faculty</th>
                            <th className="px-4 py-3 text-left font-bold hidden sm:table-cell">Position</th>
                            <th className="px-4 py-3 text-left font-bold hidden md:table-cell">Department</th>
                            <th className="px-4 py-3 text-left font-bold hidden lg:table-cell">Email</th>
                            <th className="px-4 py-3 text-center font-bold">Status</th>
                            <th className="px-4 py-3 text-center font-bold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${divider}`}>
                          {page.map(f => (
                            <tr key={f.id} onClick={() => handleFacultyClick(f)} className={`cursor-pointer transition-colors ${rowHover}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <FacultyAvatar faculty={f} size="sm" dark={dark} />
                                  <span className={`font-semibold ${boldText}`}>{f.first_name} {f.last_name}</span>
                                </div>
                              </td>
                              <td className={`px-4 py-3 hidden sm:table-cell text-xs ${labelText}`}>{f.position || '—'}</td>
                              <td className={`px-4 py-3 hidden md:table-cell text-xs ${labelText}`}>{f.department?.department_name || '—'}</td>
                              <td className={`px-4 py-3 hidden lg:table-cell text-xs ${labelText}`}>{f.email || '—'}</td>
                              <td className="px-4 py-3 text-center">
                                {f.employment_status === 'Full-Time'
                                  ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">Full-Time</span>
                                  : <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{f.employment_status}</span>}
                              </td>
                              <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1">
                                  <button onClick={() => handleEditFaculty(f)}
                                    className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                  </button>
                                  <button onClick={() => handleDeleteFaculty(f.id)}
                                    className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <LoadMore />
                  </div>
                );

                // List view (default)
                return (
                  <div>
                    <div className={`divide-y ${divider}`}>
                      {page.map(f => (
                        <div key={f.id} onClick={() => handleFacultyClick(f)}
                          className={`py-3.5 flex items-center justify-between group cursor-pointer -mx-2 px-2 rounded-xl transition-colors ${rowHover}`}>
                          <div className="flex items-center gap-3">
                            <FacultyAvatar faculty={f} size="md" dark={dark} />
                            <div>
                              <p className={`text-sm font-semibold group-hover:text-orange-500 transition-colors ${boldText}`}>
                                {f.first_name} {f.middle_name ? f.middle_name[0] + '. ' : ''}{f.last_name}
                              </p>
                              <div className={`flex items-center gap-3 mt-0.5 text-xs ${labelText}`}>
                                <span className="flex items-center gap-1"><BuildingOfficeIcon className="w-3 h-3" />{f.position || 'N/A'}</span>
                                <span className={`${dark ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
                                <span>{f.department?.department_name || 'N/A'}</span>
                                <span className={`${dark ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
                                <span className="flex items-center gap-1"><EnvelopeIcon className="w-3 h-3" />{f.email}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            {f.employment_status === 'Full-Time'
                              ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/15 text-green-500">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Full-Time
                                </span>
                              : <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>{f.employment_status}</span>}
                            <button onClick={() => handleEditFaculty(f)}
                              className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDeleteFaculty(f.id)}
                              className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <LoadMore />
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* No faculty selected placeholder */}
        {activeTab !== 'overview' && !selectedFaculty && (
          <div className="h-full flex flex-col items-center justify-center text-center min-h-[400px] p-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <UsersIcon className={`w-8 h-8 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${boldText}`}>No Faculty Selected</h3>
            <p className={labelText}>Select a faculty member from the Overview tab.</p>
            <button onClick={() => setActiveTab('overview')}
              className={`mt-6 px-4 py-2 font-medium rounded-xl transition-colors ${dark ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              Return to Overview
            </button>
          </div>
        )}

        {/* Faculty profile inline tabs */}
        {activeTab !== 'overview' && selectedFaculty && (
          <div className={`p-6 transition-colors duration-300 ${dark ? 'bg-slate-950/40' : 'bg-slate-50/20'}`}>
            <FacultyProfileTabs
              activeTab={activeTab}
              faculty={selectedFaculty}
              schedules={schedules}
              onEditClick={handleEditFaculty}
              onDeleteClick={handleDeleteFaculty}
            />
          </div>
        )}
      </div>

      <FacultyExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} faculties={faculties} />
      <AddFacultyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onFacultyAdded={() => reloadFaculties()} />
      <EditFacultyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        faculty={selectedFaculty}
        onFacultyUpdated={async () => {
          await reloadFaculties();
          if (selectedFaculty) {
            const fresh = await api.faculties.get(selectedFaculty.id).catch(() => null);
            if (fresh) setSelectedFaculty(fresh);
          }
        }}
      />
      <DeleteFacultyModal
        isOpen={isDeleteModalOpen}
        facultyName={selectedFaculty ? `${selectedFaculty.first_name} ${selectedFaculty.last_name}` : ''}
        onConfirm={confirmDeleteFaculty}
        onCancel={() => { setIsDeleteModalOpen(false); setFacultyToDelete(null); }}
      />
    </div>
  );
};

export default FacultyModule;
