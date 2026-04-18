import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import AddFacultyModal from './AddFacultyModal';
import EditFacultyModal from './EditFacultyModal';
import FacultyDetailModal from './FacultyDetailModal';
import DeleteFacultyModal from './DeleteFacultyModal';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  UsersIcon, CheckCircleIcon, ClockIcon,
  MagnifyingGlassIcon, PlusIcon, ArrowUpTrayIcon,
  ChevronRightIcon, BuildingOfficeIcon, EnvelopeIcon,
  Squares2X2Icon, TableCellsIcon, ListBulletIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

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
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {f.first_name?.[0]}{f.last_name?.[0]}
          </div>
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
  const stats = {
    total:    faculties.length,
    fullTime: faculties.filter(f => f.employment_status === 'Full-Time').length,
    partTime: faculties.filter(f => f.employment_status !== 'Full-Time').length,
  };
  const [activeTab, setActiveTab]   = useState('overview');
  const [viewMode, setViewMode]     = useState('list');
  const [listSearch, setListSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen]     = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete]     = useState(null);
  const [selectedFaculty, setSelectedFaculty]     = useState(null);

  const reloadFaculties = async () => { if (onReload) await onReload(); };

  useEffect(() => {
    if (routeId) {
      api.faculties.get(routeId)
        .then(f => { setSelectedFaculty(f); setActiveTab('faculty_details'); setIsDetailModalOpen(true); })
        .catch(() => {});
    }
  }, []); // eslint-disable-line

  const handleFacultyClick = (f) => {
    setSelectedFaculty(f);
    setIsDetailModalOpen(true);
    navigate(`/admin/reports/${f.id}`, { replace: true });
  };

  const handleEditFaculty   = (f) => { setSelectedFaculty(f); setIsEditModalOpen(true); };
  const handleDeleteFaculty = (id) => { setFacultyToDelete(id); setIsDeleteModalOpen(true); };

  const confirmDeleteFaculty = async () => {
    try {
      await api.faculties.delete(facultyToDelete);
      await reloadFaculties();
      setIsDeleteModalOpen(false);
      setIsDetailModalOpen(false);
      setSelectedFaculty(null);
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
            <button onClick={() => window.open('http://localhost:8000/api/faculties/export/csv', '_blank')}
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
          {[{ id: 'overview', label: 'Overview' }, { id: 'faculty_details', label: 'Faculty Details' }]
            .filter(tab => selectedFaculty || tab.id === 'overview')
            .map(tab => (
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
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(f => <FacultyCard key={f.id} faculty={f} onSelect={handleFacultyClick} onEdit={handleEditFaculty} onDelete={handleDeleteFaculty} dark={dark} />)}
                </div>
              ) : viewMode === 'table' ? (
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
                      {filtered.map(f => (
                        <tr key={f.id} onClick={() => handleFacultyClick(f)} className={`cursor-pointer transition-colors ${rowHover}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {f.first_name?.[0]}{f.last_name?.[0]}
                              </div>
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
              ) : (
                // List view (default)
                <div className={`divide-y ${divider}`}>
                  {filtered.map(f => (
                    <div key={f.id} onClick={() => handleFacultyClick(f)}
                      className={`py-3.5 flex items-center justify-between group cursor-pointer -mx-2 px-2 rounded-xl transition-colors ${rowHover}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {f.first_name?.[0]}{f.last_name?.[0]}
                        </div>
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
              )}
            </div>
          </div>
        )}

        {/* Faculty Details placeholder when no faculty selected */}
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
      </div>

      <AddFacultyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onFacultyAdded={() => reloadFaculties()} />
      <FacultyDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedFaculty(null); navigate('/admin/reports', { replace: true }); }}
        faculty={selectedFaculty}
      />
      <EditFacultyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        faculty={selectedFaculty}
        onFacultyUpdated={async () => {
          const data = await reloadFaculties();
          if (selectedFaculty) {
            const updated = data?.find(f => f.id === selectedFaculty.id);
            if (updated) { setSelectedFaculty(updated); setIsDetailModalOpen(true); }
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
