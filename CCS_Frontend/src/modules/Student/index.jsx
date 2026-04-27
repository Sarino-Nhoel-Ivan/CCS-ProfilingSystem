import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { STORAGE_URL } from '../../utils/config';
import {
  UserGroupIcon, NoSymbolIcon,
  MagnifyingGlassIcon, AcademicCapIcon, IdentificationIcon,
  ArrowUpTrayIcon, PlusIcon, Squares2X2Icon, TableCellsIcon, ListBulletIcon,
  ChevronRightIcon, CalendarDaysIcon, FunnelIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import StudentProfileTabs from './StudentProfileTabs';
import ExportModal from './ExportModal';
import { useDarkMode } from '../../context/DarkModeContext';

const Avatar = ({ student, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-sm' : 'w-9 h-9 text-sm';
  const initials = `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`;
  const photoSrc = student.profile_photo
    ? (student.profile_photo.startsWith('http') ? student.profile_photo : `${STORAGE_URL}/${student.profile_photo}`)
    : null;
  if (photoSrc && !imgError)
    return <img src={photoSrc} alt={initials} className={`${sz} rounded-full object-cover shrink-0 ring-2 ring-white/20`} onError={() => setImgError(true)} />;
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
};

const StudentCard = ({ student: s, onSelect, onEdit, onDelete, checked, onCheck, dark }) => {
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const labelText = dark ? 'text-slate-400' : 'text-slate-500';
  return (
    <div
      className={`group relative rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl overflow-hidden
        ${dark
          ? 'bg-slate-800 border-slate-700 hover:border-orange-500/50 hover:shadow-orange-500/10'
          : 'bg-white border-slate-200 hover:border-orange-400/60 hover:shadow-orange-500/10'}`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${s.enrollment_status === 'Enrolled' ? 'bg-gradient-to-b from-orange-400 to-orange-500' : 'bg-gradient-to-b from-slate-300 to-slate-400'}`} />
      <div className="pl-4 pr-5 pt-5 pb-4" onClick={() => onSelect(s.id)}>
        <div className="flex items-start gap-3 mb-4">
          <div className="relative shrink-0">
            <Avatar student={s} size="lg" />
            {s.enrollment_status === 'Enrolled' && (
              <CheckCircleSolid className="w-4 h-4 text-green-500 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate leading-tight ${boldText}`}>{s.first_name} {s.last_name}</p>
            <div className={`flex items-center gap-1 mt-0.5 text-xs ${labelText}`}>
              <IdentificationIcon className="w-3 h-3 shrink-0" />
              <span className="font-mono">{s.student_number || `ID: ${s.id}`}</span>
            </div>
          </div>
          <ChevronRightIcon className={`w-4 h-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
        </div>
        <div className={`space-y-1.5 text-xs border-t pt-3 ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className={`flex items-center gap-1.5 ${labelText}`}>
            <AcademicCapIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{s.program || 'No program'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 ${labelText}`}>
              <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{s.year_level || 'N/A'}</span>
            </div>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
              {s.student_type || 'N/A'}
            </span>
          </div>
        </div>
      </div>
      {/* Card footer — always-visible actions */}
      <div className={`flex items-center justify-between px-4 pb-4 pt-2 border-t ${dark ? 'border-slate-700/60' : 'border-slate-100'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {/* Edit */}
          <button onClick={e => { e.stopPropagation(); onEdit(s); }}
            className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          {/* Delete */}
          <button onClick={e => { e.stopPropagation(); onDelete(s.id); }}
            className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          {/* Checkbox beside delete */}
          <input type="checkbox" checked={checked} onChange={e => { e.stopPropagation(); onCheck(s.id, e); }} onClick={e => e.stopPropagation()}
            className="w-4 h-4 rounded accent-orange-500 cursor-pointer ml-0.5" />
        </div>
        {s.enrollment_status === 'Enrolled'
          ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Enrolled
            </span>
          : <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{s.enrollment_status}</span>}
      </div>
    </div>
  );
};

const StudentModule = ({ students: propStudents = [], skills: propSkills = [], courses: propCourses = [], loading: propLoading = false, onReload }) => {
  const dark = useDarkMode();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  // Use props directly — no local fetching, no local loading state
  const students        = propStudents;
  const availableSkills = propSkills;
  const availableCourses = propCourses;
  const isLoading       = propLoading;
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    api.schedules.getAll().then(setSchedules).catch(() => {});
  }, []);
  const stats = {
    total:      students.length,
    enrolled:   students.filter(s => s.enrollment_status === 'Enrolled').length,
    notEnrolled: students.filter(s => s.enrollment_status === 'Not Enrolled').length,
  };
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [listSearch, setListSearch] = useState('');
  const [listFilter, setListFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filterSkill, setFilterSkill] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterAffil, setFilterAffil] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 50;
  const PAGE_LOAD_SIZE = 50; // items loaded per scroll trigger
  const MAX_PER_PAGE = 100; // max items shown before requiring Next page click
  const sentinelRef = useRef(null);

  // IntersectionObserver — auto-load more items when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(v => v + PAGE_LOAD_SIZE);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Reset pagination whenever filters or search change
  useEffect(() => { setVisibleCount(50); setCurrentPage(1); }, [listSearch, listFilter, filterSkill, filterCourse, filterAffil, filterYear, viewMode]);

  const card      = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const tabBar    = dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const tabContent = dark ? 'bg-slate-950/40' : 'bg-slate-50/20';
  const divider   = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const rowHover  = dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const labelText = dark ? 'text-slate-400' : 'text-slate-500';
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const inputCls  = dark
    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-orange-400'
    : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-orange-400';
  const selectCls = dark
    ? 'bg-slate-800 border-slate-600 text-slate-200 focus:border-orange-400'
    : 'bg-white border-slate-200 text-slate-700 focus:border-orange-400';

  const handleStudentClick = async (id) => {
    try {
      setIsDetailLoading(true);
      const data = await api.students.get(id);
      setSelectedStudent(data);
      setActiveTab('personal_details');
      navigate(`/admin/users/${id}`, { replace: true });
    } catch (error) {
      console.error('Failed to load student details:', error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => { if (routeId) handleStudentClick(routeId); }, []); // eslint-disable-line

  const reloadStudents = async () => { if (onReload) await onReload(); };

  const handleEditStudent = () => setIsEditModalOpen(true);
  const handleDeleteStudent = (id) => { setStudentToDelete(id); setIsDeleteModalOpen(true); };
  const confirmDelete = async () => {
    try {
      await api.students.delete(studentToDelete);
      await reloadStudents();
      setSelectedStudent(null);
      setActiveTab('overview');
    } catch (error) {
      console.error('Failed to delete student:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected student${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all([...selectedIds].map(id => api.students.delete(id)));
      await reloadStudents();
      setSelectedIds(new Set());
      if (selectedStudent && selectedIds.has(selectedStudent.id)) {
        setSelectedStudent(null);
        setActiveTab('overview');
      }
    } catch (error) {
      console.error('Bulk delete failed:', error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids) => {
    setSelectedIds(prev => {
      const allSelected = ids.every(id => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      }
      return new Set([...prev, ...ids]);
    });
  };

  const tabs = [
    { id: 'overview',              label: 'Overview' },
    { id: 'personal_details',      label: 'Personal Details' },
    { id: 'skills_certifications', label: 'Skills & Certifications' },
    { id: 'academic_history',      label: 'Academic History' },
    { id: 'subjects',              label: 'Subjects' },
    { id: 'violations',            label: 'Violations' },
  ];

  const enrollPct = stats.total ? Math.round((stats.enrolled / stats.total) * 100) : 0;
  const activeFiltersCount = [filterSkill, filterCourse, filterAffil, filterYear].filter(Boolean).length;

  return (
    <div className="flex flex-col h-full w-full space-y-5">

      {/* ── Hero Header ── */}
      <div className={`relative rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-400/5 pointer-events-none rounded-2xl" />
        <div className="relative p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
              <UserGroupIcon className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>CCS Profiling System</p>
              <h1 className={`text-xl font-extrabold tracking-tight ${boldText}`}>Student Information</h1>
              <p className={`text-xs mt-0.5 ${labelText}`}>Manage student profiles, academic records, and personal histories.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Enrollment ring */}
            <div className={`flex items-center gap-2 pr-3 border-r ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke={dark ? '#1e293b' : '#f1f5f9'} strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f97316" strokeWidth="3.5"
                    strokeDasharray={`${enrollPct} ${100 - enrollPct}`} strokeLinecap="round" />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-extrabold ${boldText}`}>{enrollPct}%</span>
              </div>
              <div className="hidden sm:block">
                <p className={`text-[11px] font-semibold ${labelText}`}>Enrollment Rate</p>
                <p className={`text-sm font-bold ${boldText}`}>{stats.enrolled} / {stats.total}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 font-semibold text-xs rounded-xl transition-colors border ${dark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}>
              <ArrowUpTrayIcon className="w-3.5 h-3.5" />Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-orange-500/30">
              <PlusIcon className="w-3.5 h-3.5" />Add Student
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Students',     value: stats.total,      icon: UserGroupIcon,    accent: 'border-l-orange-500', iconBg: dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500' },
          { label: 'Currently Enrolled', value: stats.enrolled,   icon: CheckCircleSolid, accent: 'border-l-green-500',  iconBg: dark ? 'bg-green-900/40 text-green-400'  : 'bg-green-50 text-green-500'  },
          { label: 'Not Enrolled',       value: stats.notEnrolled, icon: NoSymbolIcon,    accent: 'border-l-slate-400',  iconBg: dark ? 'bg-slate-800 text-slate-500'     : 'bg-slate-100 text-slate-400' },
        ].map(({ label, value, icon: Icon, accent, iconBg }) => (
          <div key={label} className={`p-5 rounded-2xl border-l-4 border shadow-sm flex items-center gap-4 transition-colors duration-300 ${accent} ${card}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
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
          {tabs.filter(tab => selectedStudent || tab.id === 'overview').map((tab) => (
            <button key={tab.id}
              onClick={() => {
                if (tab.id === 'overview') { setSelectedStudent(null); navigate('/admin/users', { replace: true }); }
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

        {/* Tab Content */}
        <div className={`p-6 transition-colors duration-300 ${tabContent}`}>

          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <div className={`rounded-xl border shadow-sm transition-colors duration-300 ${card}`}>

              {/* List header */}
              <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-5 rounded-full ${dark ? 'bg-orange-400' : 'bg-orange-500'}`} />
                  <h3 className={`text-base font-bold ${boldText}`}>Student List</h3>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    dark
                      ? 'bg-orange-900/20 border-orange-800/40 text-orange-300'
                      : 'bg-orange-50 border-orange-100 text-orange-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-orange-400' : 'bg-orange-500'}`} />
                    {students.length} total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Filter toggle */}
                  <button onClick={() => setShowFilters(v => !v)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors
                      ${showFilters
                        ? 'bg-orange-500 text-white border-orange-500'
                        : dark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    <FunnelIcon className="w-3.5 h-3.5" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                  {/* View toggle */}
                  <div className={`flex rounded-lg border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                    {[
                      { id: 'cards', icon: <Squares2X2Icon className="w-3.5 h-3.5" /> },
                      { id: 'table', icon: <TableCellsIcon className="w-3.5 h-3.5" /> },
                      { id: 'list',  icon: <ListBulletIcon className="w-3.5 h-3.5" /> },
                    ].map(v => (
                      <button key={v.id} onClick={() => setViewMode(v.id)} title={v.id}
                        className={`px-2.5 py-1.5 transition-colors ${viewMode === v.id
                          ? 'bg-orange-500 text-white'
                          : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                        {v.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search + enrollment filter */}
              <div className={`flex gap-3 px-5 py-3 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Search name or number..."
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`} />
                  {listSearch && (
                    <button onClick={() => setListSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <XMarkIcon className={`w-4 h-4 ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} />
                    </button>
                  )}
                </div>
                <select value={listFilter} onChange={e => setListFilter(e.target.value)}
                  className={`rounded-xl border text-sm px-3 py-2.5 outline-none transition-colors ${selectCls}`}>
                  <option value="All">All Status</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Not Enrolled">Not Enrolled</option>
                </select>
              </div>

              {/* Advanced filters */}
              {showFilters && (
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-3 border-b ${dark ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-100 bg-slate-50/60'}`}>
                  {[
                    { value: filterSkill,  setter: setFilterSkill,  placeholder: 'All Skills',
                      options: availableSkills.map(s => ({ value: s.id, label: s.skill_name })) },
                    { value: filterCourse, setter: setFilterCourse, placeholder: 'All Courses',
                      options: availableCourses.map(c => ({ value: c.id, label: c.course_code })) },
                    { value: filterAffil,  setter: setFilterAffil,  placeholder: 'All Affiliations',
                      options: [...new Set(students.flatMap(s => s.affiliations?.map(a => a.organization_name) ?? []))].sort().map(o => ({ value: o, label: o })) },
                    { value: filterYear,   setter: setFilterYear,   placeholder: 'All Years',
                      options: ['1st Year','2nd Year','3rd Year','4th Year'].map(y => ({ value: y, label: y })) },
                  ].map(({ value, setter, placeholder, options }) => (
                    <select key={placeholder} value={value} onChange={e => setter(e.target.value)}
                      className={`rounded-lg border text-xs px-2.5 py-2 outline-none transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                      <option value="">{placeholder}</option>
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ))}
                </div>
              )}

              {/* Results */}
              <div className="p-5">
                {isLoading ? (
                  <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                  </div>
                ) : students.length === 0 ? (
                  <div className={`py-12 flex flex-col items-center justify-center text-center ${labelText}`}>
                    <UserGroupIcon className="w-10 h-10 mb-3 opacity-30" />
                    <p className="font-semibold">No students yet</p>
                    <p className="text-xs mt-1 opacity-70">Click "Add Student" to get started</p>
                  </div>
                ) : (() => {
                  const filtered = students.filter(s => {
                    const matchSearch = !listSearch || `${s.first_name} ${s.last_name} ${s.student_number || ''}`.toLowerCase().includes(listSearch.toLowerCase());
                    const matchFilter = listFilter === 'All' || s.enrollment_status === listFilter;
                    const matchSkill  = !filterSkill  || s.skills?.some(sk => String(sk.id) === filterSkill);
                    const matchCourse = !filterCourse || String(s.course_id) === filterCourse;
                    const matchAffil  = !filterAffil  || s.affiliations?.some(a => a.organization_name === filterAffil);
                    const matchYear   = !filterYear   || s.year_level === filterYear;
                    return matchSearch && matchFilter && matchSkill && matchCourse && matchAffil && matchYear;
                  });

                  if (filtered.length === 0) return (
                    <div className={`py-12 flex flex-col items-center justify-center text-center ${labelText}`}>
                      <MagnifyingGlassIcon className="w-10 h-10 mb-3 opacity-30" />
                      <p className="font-semibold">No students match your search</p>
                      <p className="text-xs mt-1 opacity-70">Try adjusting your filters or search term</p>
                    </div>
                  );

                  const totalPages = Math.ceil(filtered.length / MAX_PER_PAGE);
                  const safePage   = Math.min(currentPage, Math.max(1, totalPages));
                  // Items for this page group (up to MAX_PER_PAGE)
                  const pageStart  = (safePage - 1) * MAX_PER_PAGE;
                  const pageItems  = filtered.slice(pageStart, pageStart + MAX_PER_PAGE);
                  // Within this page, show only visibleCount items (grows via scroll)
                  const safeVisible = Math.min(visibleCount, pageItems.length);
                  const page        = pageItems.slice(0, safeVisible);
                  const canLoadMore = safeVisible < pageItems.length;

                  // Pagination controls (between page groups)
                  const PageNav = () => totalPages > 1 ? (
                    <div className={`flex items-center justify-between pt-4 mt-2 border-t ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                      <p className={`text-xs ${labelText}`}>
                        Page {safePage} of {totalPages} · {filtered.length} total
                      </p>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setCurrentPage(1); setVisibleCount(PAGE_LOAD_SIZE); }} disabled={safePage === 1}
                          className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 ${dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>«</button>
                        <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setVisibleCount(PAGE_LOAD_SIZE); }} disabled={safePage === 1}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 ${dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>‹ Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                          .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx-1] > 1) acc.push('…'); acc.push(p); return acc; }, [])
                          .map((p, i) => p === '…'
                            ? <span key={`e${i}`} className={`px-2 text-xs ${labelText}`}>…</span>
                            : <button key={p} onClick={() => { setCurrentPage(p); setVisibleCount(PAGE_LOAD_SIZE); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${p === safePage ? 'bg-orange-500 border-orange-500 text-white' : dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
                          )}
                        <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); setVisibleCount(PAGE_LOAD_SIZE); }} disabled={safePage === totalPages}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 ${dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Next ›</button>
                        <button onClick={() => { setCurrentPage(totalPages); setVisibleCount(PAGE_LOAD_SIZE); }} disabled={safePage === totalPages}
                          className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 ${dark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>»</button>
                      </div>
                    </div>
                  ) : null;

                  // Sentinel div — IntersectionObserver triggers loading more items
                  const Sentinel = () => canLoadMore ? (
                    <div ref={sentinelRef} className="h-8 flex items-center justify-center">
                      <div className={`w-5 h-5 border-2 rounded-full animate-spin ${dark ? 'border-slate-700 border-t-orange-400' : 'border-slate-200 border-t-orange-500'}`} />
                    </div>
                  ) : null;

                  const LoadMore = () => <><PageNav /></>;
                  // eslint-disable-next-line react-hooks/exhaustive-deps

                  // ── Bulk action bar (shared across all views) ──
                  const BulkBar = () => selectedIds.size > 0 ? (
                    <div className={`flex items-center justify-between px-3 py-2 mb-3 rounded-xl border ${dark ? 'bg-red-900/20 border-red-800/40' : 'bg-red-50 border-red-200'}`}>
                      <span className={`text-xs font-semibold ${dark ? 'text-red-300' : 'text-red-700'}`}>
                        {selectedIds.size} student{selectedIds.size > 1 ? 's' : ''} selected
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedIds(new Set())}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                          Clear
                        </button>
                        <button onClick={handleBulkDelete} disabled={isBulkDeleting}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50">
                          {isBulkDeleting
                            ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting...</>
                            : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Delete Selected</>}
                        </button>
                      </div>
                    </div>
                  ) : null;

                  // Cards view
                  if (viewMode === 'cards') return (
                    <div>
                      <BulkBar />
                      {/* Select All row */}
                      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                        <span className={`text-xs font-medium ${labelText}`}>{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <span className={`text-xs font-semibold ${labelText}`}>Select All</span>
                          <input type="checkbox"
                            checked={page.length > 0 && page.every(s => selectedIds.has(s.id))}
                            onChange={() => toggleSelectAll(page.map(s => s.id))}
                            className="w-4 h-4 rounded accent-orange-500 cursor-pointer" />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {page.map(s => (
                          <StudentCard key={s.id} student={s} dark={dark}
                            onSelect={handleStudentClick}
                            onEdit={async (st) => { await handleStudentClick(st.id); setIsEditModalOpen(true); }}
                            onDelete={handleDeleteStudent}
                            checked={selectedIds.has(s.id)}
                            onCheck={toggleSelect}
                          />
                        ))}
                      </div>
                      <Sentinel />
                      <LoadMore />
                    </div>
                  );

                  // Table view
                  if (viewMode === 'table') return (
                    <div>
                      <BulkBar />
                      <div className={`overflow-x-auto rounded-xl border ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
                        <table className="w-full text-sm">
                          <thead className={`text-xs uppercase tracking-wider ${dark ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                            <tr>
                              <th className="px-4 py-3 text-left font-bold">Student</th>
                              <th className="px-4 py-3 text-left font-bold hidden sm:table-cell">Number</th>
                              <th className="px-4 py-3 text-left font-bold hidden md:table-cell">Program</th>
                              <th className="px-4 py-3 text-left font-bold hidden md:table-cell">Year</th>
                              <th className="px-4 py-3 text-left font-bold hidden lg:table-cell">Type</th>
                              <th className="px-4 py-3 text-center font-bold">Status</th>
                              <th className="px-4 py-3 text-center font-bold">
                                <div className="flex items-center justify-center gap-1.5">
                                  Actions
                                  <input type="checkbox"
                                    checked={page.length > 0 && page.every(s => selectedIds.has(s.id))}
                                    onChange={() => toggleSelectAll(page.map(s => s.id))}
                                    title="Select all"
                                    className="w-3.5 h-3.5 rounded accent-orange-500 cursor-pointer" />
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${divider}`}>
                            {page.map(s => (
                              <tr key={s.id} onClick={() => handleStudentClick(s.id)}
                                className={`cursor-pointer transition-colors ${rowHover}`}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2.5">
                                    <Avatar student={s} size="sm" />
                                    <span className={`font-semibold ${boldText}`}>{s.first_name} {s.last_name}</span>
                                  </div>
                                </td>
                                <td className={`px-4 py-3 hidden sm:table-cell font-mono text-xs ${labelText}`}>{s.student_number || `#${s.id}`}</td>
                                <td className={`px-4 py-3 hidden md:table-cell text-xs ${labelText}`}>{s.program || '—'}</td>
                                <td className={`px-4 py-3 hidden md:table-cell text-xs ${labelText}`}>{s.year_level || '—'}</td>
                                <td className={`px-4 py-3 hidden lg:table-cell text-xs ${labelText}`}>{s.student_type || '—'}</td>
                                <td className="px-4 py-3 text-center">
                                  {s.enrollment_status === 'Enrolled'
                                    ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">Enrolled</span>
                                    : <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{s.enrollment_status}</span>}
                                </td>
                                <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                  <div className="flex items-center justify-center gap-1">
                                    <button onClick={async (e) => { e.stopPropagation(); await handleStudentClick(s.id); setIsEditModalOpen(true); }}
                                      className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); handleDeleteStudent(s.id); }}
                                      className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                    <input type="checkbox" checked={selectedIds.has(s.id)}
                                      onChange={e => toggleSelect(s.id, e)} onClick={e => e.stopPropagation()}
                                      className="w-4 h-4 rounded accent-orange-500 cursor-pointer" />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Sentinel />
                      <LoadMore />
                    </div>
                  );

                  // List view (default)
                  return (
                    <div>
                      <BulkBar />
                      <div className={`divide-y ${divider}`}>
                        {/* Select All header */}
                        {page.length > 0 && (
                          <div className={`py-2 flex items-center justify-between -mx-2 px-2`}>
                            <span className={`text-xs font-medium ${labelText}`}>{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <span className={`text-xs font-semibold ${labelText}`}>Select All</span>
                              <input type="checkbox"
                                checked={page.every(s => selectedIds.has(s.id))}
                                onChange={() => toggleSelectAll(page.map(s => s.id))}
                                className="w-4 h-4 rounded accent-orange-500 cursor-pointer shrink-0" />
                            </label>
                          </div>
                        )}
                        {page.map(s => (
                          <div key={s.id}
                            className={`py-3.5 flex items-center justify-between group -mx-2 px-2 rounded-xl transition-colors ${rowHover}`}>
                            {/* Student info — clickable to open profile */}
                            <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => handleStudentClick(s.id)}>
                              <Avatar student={s} />
                              <div className="min-w-0">
                                <p className={`text-sm font-semibold group-hover:text-orange-500 transition-colors truncate ${boldText}`}>
                                  {s.first_name} {s.middle_name ? s.middle_name[0] + '. ' : ''}{s.last_name}
                                </p>
                                <div className={`flex items-center gap-3 mt-0.5 text-xs ${labelText}`}>
                                  <span className="flex items-center gap-1"><AcademicCapIcon className="w-3 h-3" />{s.program || 'N/A'}</span>
                                  <span className="flex items-center gap-1"><CalendarDaysIcon className="w-3 h-3" />{s.year_level || 'N/A'}</span>
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{s.student_type || 'N/A'}</span>
                                  <span className="flex items-center gap-1 font-mono"><IdentificationIcon className="w-3 h-3" />{s.student_number || s.id}</span>
                                </div>
                              </div>
                            </div>
                            {/* Right side: status + edit + delete + checkbox */}
                            <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                              {s.enrollment_status === 'Enrolled'
                                ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/15 text-green-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Enrolled
                                  </span>
                                : <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>{s.enrollment_status}</span>}
                              {/* Edit */}
                              <button
                                onClick={async (e) => { e.stopPropagation(); await handleStudentClick(s.id); setIsEditModalOpen(true); }}
                                title="Edit student"
                                className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-500 hover:text-orange-400 hover:bg-orange-500/10' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              {/* Delete */}
                              <button
                                onClick={e => { e.stopPropagation(); handleDeleteStudent(s.id); }}
                                title="Delete student"
                                className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                              {/* Checkbox beside delete */}
                              <input
                                type="checkbox"
                                checked={selectedIds.has(s.id)}
                                onChange={e => toggleSelect(s.id, e)}
                                onClick={e => e.stopPropagation()}
                                className="w-4 h-4 rounded accent-orange-500 cursor-pointer shrink-0"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Sentinel />
                      <LoadMore />
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* No student selected */}
          {activeTab !== 'overview' && !selectedStudent && (
            <div className="h-full flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <UserGroupIcon className={`w-8 h-8 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
              </div>
              <h3 className={`text-lg font-bold mb-1 ${boldText}`}>No Student Selected</h3>
              <p className={labelText}>Select a student from the Overview tab to view their profile.</p>
              <button onClick={() => setActiveTab('overview')}
                className={`mt-6 px-4 py-2 font-medium rounded-xl transition-colors ${dark ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                Return to Overview
              </button>
            </div>
          )}

          {/* Student profile */}
          {activeTab !== 'overview' && selectedStudent && (
            <div className="relative">
              {isDetailLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-xl z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                </div>
              )}
              <StudentProfileTabs
                activeTab={activeTab}
                student={selectedStudent}
                schedules={schedules}
                onEditClick={handleEditStudent}
                onDeleteClick={handleDeleteStudent}
              />
            </div>
          )}

        </div>
      </div>

      <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onStudentAdded={() => reloadStudents()} />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        students={students}
        selectedStudent={selectedStudent}
      />
      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
        onStudentUpdated={async () => { await reloadStudents(); if (selectedStudent) handleStudentClick(selectedStudent.id); }}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        studentName={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ''}
        onConfirm={confirmDelete}
        onCancel={() => { setIsDeleteModalOpen(false); setStudentToDelete(null); }}
      />
    </div>
  );
};

export default StudentModule;
