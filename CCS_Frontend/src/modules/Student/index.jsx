import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { STORAGE_URL } from '../../utils/config';
import {
  UserGroupIcon, CheckCircleIcon, NoSymbolIcon,
  MagnifyingGlassIcon, AcademicCapIcon, IdentificationIcon,
  ArrowUpTrayIcon, PlusIcon, Squares2X2Icon, TableCellsIcon, ListBulletIcon,
  ChevronRightIcon, CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import StudentProfileTabs from './StudentProfileTabs';
import { useDarkMode } from '../../context/DarkModeContext';

const Avatar = ({ student, size = 'md' }) => {
  const [imgError, setImgError] = useState(false);
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-10 h-10 text-sm' : 'w-9 h-9 text-sm';
  const initials = `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`;
  if (student.profile_photo && !imgError) {
    return (
      <img
        src={`${STORAGE_URL}/${student.profile_photo}?v=${student.updated_at ?? ''}`}
        alt={initials}
        className={`${sz} rounded-full object-cover shrink-0`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`${sz} rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
};

const StudentModule = () => {
  const dark = useDarkMode();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, enrolled: 0, notEnrolled: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [listSearch, setListSearch] = useState('');
  const [listFilter, setListFilter] = useState('All');
  const [viewMode, setViewMode]     = useState('list'); // 'cards' | 'table' | 'list'
  // Advanced filters
  const [filterSkill, setFilterSkill]         = useState('');
  const [filterCourse, setFilterCourse]       = useState('');
  const [filterAffil, setFilterAffil]         = useState('');
  const [filterYear, setFilterYear]           = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  // ── Tailwind utility helpers keyed on dark mode ──────────────────
  const card   = dark ? 'bg-slate-900 border-slate-700/60'  : 'bg-white border-slate-100';
  const header = dark ? 'bg-slate-900 border-slate-700/60'  : 'bg-white border-slate-100';
  const tabBar = dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const tabContent = dark ? 'bg-slate-950/40' : 'bg-slate-50/20';
  const divider = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const rowHover = dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const labelText = dark ? 'text-slate-400' : 'text-slate-500';
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const statIcon1 = dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-500';
  const statIcon2 = dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-500';
  const statIcon3 = dark ? 'bg-slate-800 text-slate-500'   : 'bg-slate-100 text-slate-400';
  const exportBtn = dark
    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
    : 'bg-slate-100 hover:bg-slate-200 text-slate-700';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const [data, skills, courses] = await Promise.all([
          api.students.getAll(),
          api.skills.getAll().catch(() => []),
          api.courses.getAll().catch(() => []),
        ]);
        setStudents(data);
        setAvailableSkills(skills);
        setAvailableCourses(courses);
        const enrolledCount    = data.filter(s => s.enrollment_status === 'Enrolled').length;
        const notEnrolledCount = data.filter(s => s.enrollment_status === 'Not Enrolled').length;
        setStats({ total: data.length, enrolled: enrolledCount, notEnrolled: notEnrolledCount });
      } catch (error) {
        console.error("Failed to load students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentClick = (id) => {
    navigate(`/admin/users/${id}`);
  };

  const reloadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await api.students.getAll();
      setStudents(data);
      const enrolledCount    = data.filter(s => s.enrollment_status === 'Enrolled').length;
      const notEnrolledCount = data.filter(s => s.enrollment_status === 'Not Enrolled').length;
      setStats({ total: data.length, enrolled: enrolledCount, notEnrolled: notEnrolledCount });
      return data;
    } catch (error) {
      console.error("Failed to reload students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = () => setIsEditModalOpen(true);
  const handleDeleteStudent = (id) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    try {
      await api.students.delete(studentToDelete);
      await reloadStudents();
      setSelectedStudent(null);
      setActiveTab('overview');
    } catch (error) {
      console.error("Failed to delete student:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const tabs = [
    { id: 'overview',              label: 'Overview' },
    { id: 'personal_details',      label: 'Personal Details' },
    { id: 'skills_certifications', label: 'Skills & Certifications' },
    { id: 'academic_history',      label: 'Academic History' },
    { id: 'violations',            label: 'Violations' },
  ];

  return (
    <div className="flex flex-col h-full w-full">

      {/* ── Module Header ─────────────────────────────────────────── */}
      <div className={`flex justify-between items-end mb-6 p-6 rounded-2xl shadow-sm border transition-colors duration-300 ${header}`}>
        <div>
          <h1 className={`text-3xl font-bold tracking-tight mb-2 transition-colors duration-300 ${boldText}`}>
            Student Information
          </h1>
          <p className={`transition-colors duration-300 ${labelText}`}>
            Manage student profiles, academic records, and personal histories.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.open('http://localhost:8000/api/students/export/csv', '_blank')}
            className={`flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${exportBtn}`}
          >
            <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-brand-500/30"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* ── Quick Stats Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-5 rounded-2xl border-l-4 border border-l-brand-500 shadow-sm flex items-center gap-4 transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statIcon1}`}>
            <UserGroupIcon className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${labelText}`}>Total Students</p>
            <p className={`text-2xl font-bold mt-0.5 ${boldText}`}>{isLoading ? '...' : stats.total}</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border-l-4 border border-l-green-500 shadow-sm flex items-center gap-4 transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statIcon2}`}>
            <CheckCircleSolid className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${labelText}`}>Currently Enrolled</p>
            <p className={`text-2xl font-bold mt-0.5 ${boldText}`}>{isLoading ? '...' : stats.enrolled}</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border-l-4 border border-l-slate-400 shadow-sm flex items-center gap-4 transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statIcon3}`}>
            <NoSymbolIcon className="w-6 h-6" />
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${labelText}`}>Not Enrolled</p>
            <p className={`text-2xl font-bold mt-0.5 ${boldText}`}>{isLoading ? '...' : stats.notEnrolled}</p>
          </div>
        </div>
      </div>

      {/* ── Main Content Card ─────────────────────────────────────── */}
      <div className={`rounded-2xl shadow-sm border transition-colors duration-300 ${card}`}>

        {/* Tabs */}
        <div className={`flex border-b px-6 pt-2 transition-colors duration-300 ${tabBar}`}>
          {tabs.filter(tab => selectedStudent || tab.id === 'overview' || tab.id === 'personal_details').map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'overview') setSelectedStudent(null);
                setActiveTab(tab.id);
              }}
              className={`px-6 py-4 text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-brand-500'
                  : dark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 rounded-t-lg'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-t-lg'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`p-8 transition-colors duration-300 ${tabContent}`}>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6">

              {/* Student List */}
              <div className={`p-6 rounded-xl border shadow-sm transition-colors duration-300 ${card}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-bold transition-colors duration-300 ${boldText}`}>Student List</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{students.length} total</span>
                    {/* View toggle */}
                    <div className={`flex rounded-lg border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                      {[
                        { id: 'cards', icon: <Squares2X2Icon className="w-3.5 h-3.5" /> },
                        { id: 'table', icon: <TableCellsIcon className="w-3.5 h-3.5" /> },
                        { id: 'list',  icon: <ListBulletIcon className="w-3.5 h-3.5" /> },
                      ].map(v => (
                        <button key={v.id} onClick={() => setViewMode(v.id)} title={v.id.charAt(0).toUpperCase() + v.id.slice(1)}
                          className={`px-2.5 py-1.5 transition-colors ${viewMode === v.id
                            ? 'bg-brand-500 text-white'
                            : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                          {v.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Search + enrollment filter */}
                <div className="flex gap-3 mb-3">
                  <div className="relative flex-1">
                    <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Search name or number..."
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-brand-400'}`} />
                  </div>
                  <select value={listFilter} onChange={e => setListFilter(e.target.value)}
                    className={`rounded-xl border text-sm px-3 py-2.5 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-700 focus:border-brand-400'}`}>
                    <option value="All">All</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Not Enrolled">Not Enrolled</option>
                  </select>
                </div>

                {/* Advanced filters row */}
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 p-3 rounded-xl ${dark ? 'bg-slate-800/60 border border-slate-700/60' : 'bg-slate-50 border border-slate-200'}`}>
                  <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
                    className={`rounded-lg border text-xs px-2.5 py-2 outline-none transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <option value="">All Skills</option>
                    {availableSkills.map(s => <option key={s.id} value={s.id}>{s.skill_name}</option>)}
                  </select>
                  <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
                    className={`rounded-lg border text-xs px-2.5 py-2 outline-none transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <option value="">All Courses</option>
                    {availableCourses.map(c => <option key={c.id} value={c.id}>{c.course_code}</option>)}
                  </select>
                  <select value={filterAffil} onChange={e => setFilterAffil(e.target.value)}
                    className={`rounded-lg border text-xs px-2.5 py-2 outline-none transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <option value="">All Affiliations</option>
                    {[...new Set(students.flatMap(s => s.affiliations?.map(a => a.organization_name) ?? []))].sort().map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                  <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
                    className={`rounded-lg border text-xs px-2.5 py-2 outline-none transition-colors ${dark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <option value="">All Years</option>
                    {['1st Year','2nd Year','3rd Year','4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Results */}
                {isLoading ? (
                  <div className="py-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" /></div>
                ) : (() => {
                  const filtered = students.filter(s => {
                    const matchSearch = !listSearch || `${s.first_name} ${s.last_name} ${s.student_number || ''}`.toLowerCase().includes(listSearch.toLowerCase());
                    const matchFilter = listFilter === 'All' || s.enrollment_status === listFilter;
                    const matchSkill  = !filterSkill || s.skills?.some(sk => String(sk.id) === filterSkill);
                    const matchCourse = !filterCourse || String(s.course_id) === filterCourse;
                    const matchAffil  = !filterAffil || s.affiliations?.some(a => a.organization_name === filterAffil);
                    const matchYear   = !filterYear || s.year_level === filterYear;
                    return matchSearch && matchFilter && matchSkill && matchCourse && matchAffil && matchYear;
                  });

                  if (filtered.length === 0) return <div className={`py-8 text-center text-sm ${labelText}`}>No students match your search.</div>;

                  // ── CARDS view ──
                  if (viewMode === 'cards') return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pr-1">
                      {filtered.map(s => (
                        <div key={s.id} onClick={() => handleStudentClick(s.id)}
                          className={`group relative rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg overflow-hidden ${dark ? 'bg-slate-800 border-slate-700 hover:border-brand-500/50 hover:shadow-brand-500/10' : 'bg-white border-slate-200 hover:border-brand-400/60 hover:shadow-brand-500/10'}`}>
                          {/* Top accent bar */}
                          <div className={`h-1 w-full ${s.enrollment_status === 'Enrolled' ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-gradient-to-r from-slate-300 to-slate-400'}`} />
                          <div className="p-5">
                            {/* Header row */}
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
                            {/* Info rows */}
                            <div className={`space-y-1.5 text-xs border-t pt-3 ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
                              <div className={`flex items-center gap-1.5 ${labelText}`}>
                                <AcademicCapIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{s.program || 'No program'}</span>
                              </div>
                              <div className={`flex items-center gap-1.5 ${labelText}`}>
                                <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0" />
                                <span>{s.year_level || 'N/A'}</span>
                              </div>
                            </div>
                            {/* Footer badge */}
                            <div className="mt-3 flex justify-end">
                              {s.enrollment_status === 'Enrolled'
                                ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Enrolled
                                  </span>
                                : <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{s.enrollment_status}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );

                  // ── TABLE view ──
                  if (viewMode === 'table') return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className={`text-xs uppercase tracking-wider ${dark ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                          <tr>
                            <th className="px-3 py-2.5 text-left font-bold">Student</th>
                            <th className="px-3 py-2.5 text-left font-bold hidden sm:table-cell">Number</th>
                            <th className="px-3 py-2.5 text-left font-bold hidden md:table-cell">Program</th>
                            <th className="px-3 py-2.5 text-left font-bold hidden md:table-cell">Year</th>
                            <th className="px-3 py-2.5 text-center font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${divider}`}>
                          {filtered.map(s => (
                            <tr key={s.id} onClick={() => handleStudentClick(s.id)}
                              className={`cursor-pointer transition-colors ${rowHover}`}>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <Avatar student={s} size="sm" />
                                  <span className={`font-medium ${boldText}`}>{s.first_name} {s.last_name}</span>
                                </div>
                              </td>
                              <td className={`px-3 py-3 hidden sm:table-cell font-mono text-xs ${labelText}`}>{s.student_number || `#${s.id}`}</td>
                              <td className={`px-3 py-3 hidden md:table-cell text-xs ${labelText}`}>{s.program || '—'}</td>
                              <td className={`px-3 py-3 hidden md:table-cell text-xs ${labelText}`}>{s.year_level || '—'}</td>
                              <td className="px-3 py-3 text-center">
                                {s.enrollment_status === 'Enrolled'
                                  ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">Enrolled</span>
                                  : <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{s.enrollment_status}</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );

                  // ── LIST view (default) ──
                  return (
                    <div className={`divide-y pr-1 ${divider}`}>
                      {filtered.map(s => (
                        <div key={s.id} onClick={() => handleStudentClick(s.id)}
                          className={`py-3.5 flex items-center justify-between group cursor-pointer -mx-4 px-4 rounded-lg transition-colors ${rowHover}`}>
                          <div className="flex items-center gap-3">
                            <Avatar student={s} />
                            <div>
                              <p className={`text-sm font-semibold group-hover:text-brand-500 transition-colors ${boldText}`}>
                                {s.first_name} {s.middle_name ? s.middle_name[0] + '. ' : ''}{s.last_name}
                              </p>
                              <div className={`flex items-center gap-3 mt-0.5 text-xs ${labelText}`}>
                                <span className="flex items-center gap-1">
                                  <AcademicCapIcon className="w-3 h-3" />{s.program || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <CalendarDaysIcon className="w-3 h-3" />{s.year_level || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1 font-mono">
                                  <IdentificationIcon className="w-3 h-3" />{s.student_number || s.id}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {s.enrollment_status === 'Enrolled'
                              ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-500">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  Enrolled
                                </span>
                              : <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>{s.enrollment_status}</span>}
                            <ChevronRightIcon className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                          </div>
                        </div>
                      ))}
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
              <p className={labelText}>Please select a student from the Overview tab to view their detailed profile.</p>
              <button
                onClick={() => setActiveTab('overview')}
                className={`mt-6 px-4 py-2 font-medium rounded-lg transition-colors ${dark ? 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                Return to Overview
              </button>
            </div>
          )}

          {/* Student profile */}
          {activeTab !== 'overview' && selectedStudent && (
            <StudentProfileTabs
              activeTab={activeTab}
              student={selectedStudent}
              onEditClick={handleEditStudent}
              onDeleteClick={handleDeleteStudent}
            />
          )}

        </div>
      </div>

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStudentAdded={() => reloadStudents()}
      />

      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={selectedStudent}
        onStudentUpdated={async () => {
          await reloadStudents();
          if (selectedStudent) handleStudentClick(selectedStudent.id);
        }}
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
