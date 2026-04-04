import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import AddStudentModal from './AddStudentModal';
import EditStudentModal from './EditStudentModal';
import StudentProfileTabs from './StudentProfileTabs';
import { useDarkMode } from '../../context/DarkModeContext';

const StudentModule = () => {
  const dark = useDarkMode();
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, enrolled: 0, notEnrolled: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleStudentClick = async (id) => {
    try {
      setIsLoading(true);
      const data = await api.students.get(id);
      setSelectedStudent(data);
      setActiveTab('personal_details');
    } catch (error) {
      console.error("Failed to load student details:", error);
    } finally {
      setIsLoading(false);
    }
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

  const handleEditStudent  = () => setIsEditModalOpen(true);
  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        await api.students.delete(id);
        await reloadStudents();
        setSelectedStudent(null);
        setActiveTab('overview');
      } catch (error) {
        console.error("Failed to delete student:", error);
        alert("Failed to delete student. Please try again.");
      }
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
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-brand-500/30"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* ── Quick Stats Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statIcon1}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${labelText}`}>Total Students</p>
            <p className={`text-2xl font-bold mt-0.5 ${boldText}`}>{isLoading ? '...' : stats.total}</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statIcon2}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${labelText}`}>Currently Enrolled</p>
            <p className={`text-2xl font-bold mt-0.5 ${boldText}`}>{isLoading ? '...' : stats.enrolled}</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statIcon3}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${labelText}`}>Not Enrolled</p>
            <p className={`text-2xl font-bold mt-0.5 ${boldText}`}>{isLoading ? '...' : stats.notEnrolled}</p>
          </div>
        </div>
      </div>

      {/* ── Main Content Card ─────────────────────────────────────── */}
      <div className={`flex-1 rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-colors duration-300 ${card}`}>

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
        <div className={`flex-1 p-8 overflow-y-auto transition-colors duration-300 ${tabContent}`}>

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
                        { id: 'cards', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
                        { id: 'table', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M10 3v18M3 3h18v18H3z" /></svg> },
                        { id: 'list',  icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
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
                <div className="flex gap-2 mb-3 flex-wrap">
                  <div className="relative flex-1 min-w-[160px]">
                    <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Search name or number..."
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-brand-400'}`} />
                  </div>
                  <select value={listFilter} onChange={e => setListFilter(e.target.value)}
                    className={`rounded-lg border text-sm px-3 py-2 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-700 focus:border-brand-400'}`}>
                    <option value="All">All</option>
                    <option value="Enrolled">Enrolled</option>
                    <option value="Not Enrolled">Not Enrolled</option>
                  </select>
                </div>

                {/* Advanced filters row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
                    className={`rounded-lg border text-xs px-2 py-2 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <option value="">All Skills</option>
                    {availableSkills.map(s => <option key={s.id} value={s.id}>{s.skill_name}</option>)}
                  </select>
                  <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)}
                    className={`rounded-lg border text-xs px-2 py-2 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <option value="">All Courses</option>
                    {availableCourses.map(c => <option key={c.id} value={c.id}>{c.course_code}</option>)}
                  </select>
                  <select value={filterAffil} onChange={e => setFilterAffil(e.target.value)}
                    className={`rounded-lg border text-xs px-2 py-2 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <option value="">All Affiliations</option>
                    {[...new Set(students.flatMap(s => s.affiliations?.map(a => a.organization_name) ?? []))].sort().map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                  <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
                    className={`rounded-lg border text-xs px-2 py-2 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                      {filtered.map(s => (
                        <div key={s.id} onClick={() => handleStudentClick(s.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${dark ? 'bg-slate-800 border-slate-700 hover:border-brand-500/40' : 'bg-slate-50 border-slate-200 hover:border-brand-400/50 hover:shadow-brand-500/10'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                              {s.first_name?.[0]}{s.last_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${boldText}`}>{s.first_name} {s.last_name}</p>
                              <p className={`text-xs truncate ${labelText}`}>{s.student_number || `ID: ${s.id}`}</p>
                            </div>
                            {s.enrollment_status === 'Enrolled'
                              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 shrink-0">Enrolled</span>
                              : <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{s.enrollment_status}</span>}
                          </div>
                          <div className={`mt-2 pt-2 border-t flex gap-3 text-xs ${dark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                            <span>{s.program || 'No program'}</span>
                            <span>·</span>
                            <span>{s.year_level || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );

                  // ── TABLE view ──
                  if (viewMode === 'table') return (
                    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className={`sticky top-0 text-xs uppercase tracking-wider ${dark ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
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
                                  <div className="w-7 h-7 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    {s.first_name?.[0]}{s.last_name?.[0]}
                                  </div>
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
                    <div className={`divide-y max-h-[420px] overflow-y-auto pr-1 ${divider}`}>
                      {filtered.map(s => (
                        <div key={s.id} onClick={() => handleStudentClick(s.id)}
                          className={`py-3.5 flex items-center justify-between group cursor-pointer -mx-4 px-4 rounded-lg transition-colors ${rowHover}`}>
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                              {s.first_name?.[0]}{s.last_name?.[0]}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold group-hover:text-brand-500 transition-colors ${boldText}`}>
                                {s.first_name} {s.middle_name ? s.middle_name[0] + '. ' : ''}{s.last_name}
                              </p>
                              <p className={`text-xs ${labelText}`}>{s.program || 'N/A'} · {s.year_level || 'N/A'}</p>
                              <p className={`text-xs ${labelText}`}>{s.student_number ? `No. ${s.student_number}` : `ID: ${s.id}`}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {s.enrollment_status === 'Enrolled'
                              ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400">Enrolled</span>
                              : <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>{s.enrollment_status}</span>}
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
                <svg className={`w-8 h-8 ${dark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
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
    </div>
  );
};

export default StudentModule;
