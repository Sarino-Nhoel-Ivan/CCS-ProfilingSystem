import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import AddSubjectModal from './AddSubjectModal';
import EditSubjectModal from './EditSubjectModal';
import SubjectDetailModal from './SubjectDetailModal';
import { useDarkMode } from '../../context/DarkModeContext';

// ── Curriculum Grid: subjects grouped by year level then semester ──────────
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS   = ['1st Semester', '2nd Semester'];

const CurriculumGrid = ({ subjects, dark, boldText, subText, onEdit, onDelete, onDetail }) => {
  // Collect all year levels present in the filtered subjects
  const presentYears = YEAR_LEVELS.filter(y => subjects.some(s => s.year_level === y));
  // If no year_level set, show an "Unassigned" bucket
  const hasUnassigned = subjects.some(s => !s.year_level);

  const thBg   = dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-700 text-white';
  const rowDiv = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const rowHov = dark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50';
  const codeCls = dark ? 'bg-brand-900/40 text-brand-300' : 'bg-orange-50 text-orange-600';
  const preCls  = dark ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100';

  const SubjectTable = ({ subs, yearLabel, semLabel }) => {
    const totalUnits = subs.reduce((s, sub) => s + (sub.total_units || 0), 0);
    const yearColor =
      yearLabel === '1st Year'   ? (dark ? 'bg-slate-700' : 'bg-slate-600') :
      yearLabel === '2nd Year'   ? (dark ? 'bg-slate-700' : 'bg-slate-600') :
      yearLabel === '3rd Year'   ? (dark ? 'bg-slate-700' : 'bg-slate-600') :
      yearLabel === '4th Year'   ? (dark ? 'bg-slate-700' : 'bg-slate-600') :
                                   (dark ? 'bg-slate-700' : 'bg-slate-600');
    return (
      <div className={`border-b ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
        {/* Year + Semester header — full width dark bar like the reference */}
        <div className={`flex items-center justify-between px-5 py-3 ${dark ? 'bg-slate-700/80' : 'bg-slate-600'}`}>
          <span className="text-sm font-extrabold text-white tracking-wide">{yearLabel}</span>
          <span className="text-sm font-bold text-white/80">{semLabel}</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className={`text-xs font-bold ${dark ? 'bg-slate-800/60 text-slate-400 border-b border-slate-700' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}`}>
              <th className="px-5 py-2.5 text-left">Course Code</th>
              <th className="px-5 py-2.5 text-left">Course Description</th>
              <th className="px-5 py-2.5 text-center">Units</th>
              <th className="px-5 py-2.5 text-left">Pre-requisite(s)</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${rowDiv}`}>
            {subs.map(sub => (
              <tr key={sub.id} onClick={() => onDetail(sub)} className={`cursor-pointer transition-colors ${rowHov}`}>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${codeCls}`}>
                    {sub.subject_code || '—'}
                  </span>
                </td>
                <td className={`px-5 py-3 font-semibold ${boldText}`}>{sub.descriptive_title || '—'}</td>
                <td className={`px-5 py-3 text-center font-bold ${boldText}`}>{sub.total_units ?? '—'}</td>
                <td className="px-5 py-3">
                  {sub.pre_requisites
                    ? <span className={`text-xs font-medium px-2 py-1 rounded-md ${preCls}`}>{sub.pre_requisites}</span>
                    : <span className={`text-xs italic ${subText}`}>—</span>}
                </td>
                <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(sub)}
                      className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-brand-400 hover:bg-brand-500/10' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => onDelete(sub.id)}
                      className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={`text-xs font-bold ${dark ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
              <td colSpan={2} className="px-5 py-2.5 text-right">Total No. of Units</td>
              <td className={`px-5 py-2.5 text-center font-extrabold ${boldText}`}>{totalUnits}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-0">
      {presentYears.map(year => {
        const yearSubs = subjects.filter(s => s.year_level === year);
        return (
          <div key={year}>
            {SEMESTERS.map(sem => {
              const semSubs = yearSubs.filter(s => s.semester === sem);
              if (semSubs.length === 0) return null;
              return (
                <SubjectTable key={sem} subs={semSubs} yearLabel={year} semLabel={sem} />
              );
            })}
            {/* Subjects with no semester assigned */}
            {yearSubs.filter(s => !s.semester).length > 0 && (
              <SubjectTable subs={yearSubs.filter(s => !s.semester)} yearLabel={year} semLabel="No Semester Assigned" />
            )}
          </div>
        );
      })}
      {/* Unassigned year level */}
      {hasUnassigned && (
        <div>
          {SEMESTERS.map(sem => {
            const semSubs = subjects.filter(s => !s.year_level && s.semester === sem);
            if (semSubs.length === 0) return null;
            return <SubjectTable key={sem} subs={semSubs} yearLabel="Unassigned" semLabel={sem} />;
          })}
          {subjects.filter(s => !s.year_level && !s.semester).length > 0 && (
            <SubjectTable subs={subjects.filter(s => !s.year_level && !s.semester)} yearLabel="Unassigned" semLabel="No Semester Assigned" />
          )}
        </div>
      )}
    </div>
  );
};

const InstructionModule = ({ students = [] }) => {
  const dark = useDarkMode();
  const card    = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const tableBar = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const loadBg   = dark ? 'bg-slate-900/80' : 'bg-white/80';
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    fetchSubjects();
    api.schedules.getAll().then(setSchedules).catch(() => {});
  }, []);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const data = await api.subjects.getAll();
      setSubjects(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load curriculum/subjects.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await api.subjects.delete(id);
        fetchSubjects();
      } catch (err) {
        alert(err.message || 'Failed to delete subject');
      }
    }
  };

  const openEditModal = (subject) => {
    setSelectedSubject(subject);
    setIsEditModalOpen(true);
  };

  const openDetailModal = (subject) => {
    setSelectedSubject(subject);
    setIsDetailModalOpen(true);
  };

  const totalUnits = subjects.reduce((sum, sub) => sum + (sub.total_units || 0), 0);

  // Analytics derived from subjects + schedules
  const scheduledSubjectIds = new Set(schedules.map(s => s.subject_id));
  const scheduledCount = subjects.filter(s => scheduledSubjectIds.has(s.id)).length;
  const bsitSubjects = subjects.filter(s => s.program === 'BSIT').length;
  const bscsSubjects = subjects.filter(s => s.program === 'BSCS').length;

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filterProgram,  setFilterProgram]  = useState('All');
  const [filterYear,     setFilterYear]     = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterSearch,   setFilterSearch]   = useState('');

  const filteredSubjects = subjects.filter(s => {
    const matchProgram  = filterProgram  === 'All' || s.program   === filterProgram;
    const matchYear     = filterYear     === 'All' || s.year_level === filterYear;
    const matchSemester = filterSemester === 'All' || s.semester   === filterSemester;
    const matchSearch   = !filterSearch  ||
      s.subject_code?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      s.descriptive_title?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      s.pre_requisites?.toLowerCase().includes(filterSearch.toLowerCase());
    return matchProgram && matchYear && matchSemester && matchSearch;
  });

  const activeFilterCount = [filterProgram !== 'All', filterYear !== 'All', filterSemester !== 'All', !!filterSearch].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-5 shadow-sm border flex items-center transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>Total Subjects</p>
            <h3 className={`text-2xl font-bold ${boldText}`}>{subjects.length}</h3>
          </div>
        </div>
        <div className={`rounded-2xl p-5 shadow-sm border flex items-center transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${dark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-50 text-amber-500'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>Total Units</p>
            <h3 className={`text-2xl font-bold ${boldText}`}>{totalUnits}</h3>
          </div>
        </div>
        <div className={`rounded-2xl p-5 shadow-sm border flex items-center transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>Scheduled</p>
            <h3 className={`text-2xl font-bold ${boldText}`}>{scheduledCount}</h3>
            <p className={`text-[10px] ${subText}`}>of {subjects.length} subjects</p>
          </div>
        </div>
        <div className={`rounded-2xl p-5 shadow-sm border flex items-center transition-colors duration-300 ${card}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${dark ? 'bg-violet-900/40 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>By Program</p>
            <p className={`text-xs font-bold mt-0.5 ${boldText}`}>IT: {bsitSubjects} · CS: {bscsSubjects}</p>
            <p className={`text-[10px] ${subText}`}>{subjects.filter(s => !s.program).length} unassigned</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden flex flex-col h-[calc(100vh-280px)] transition-colors duration-300 ${card}`}>
        <div className={`p-4 border-b flex flex-wrap gap-3 items-center transition-colors duration-300 ${tableBar}`}>
          <div className="flex-1 min-w-0">
            <h2 className={`text-xl font-bold transition-colors duration-300 ${boldText}`}>Curriculum Dashboard</h2>
            <p className={`text-sm mt-0.5 ${subText}`}>Manage departmental subjects, descriptive titles, and prerequisites.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Search */}
            <div className="relative">
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
                placeholder="Search subjects..."
                className={`pl-9 pr-3 py-2 rounded-xl border text-sm outline-none transition-colors w-44 ${dark ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-brand-500'}`} />
            </div>
            {/* Program filter */}
            <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}
              className={`rounded-xl border text-sm px-3 py-2 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-700 focus:border-brand-500'}`}>
              <option value="All">All Programs</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
            </select>
            {/* Year filter */}
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className={`rounded-xl border text-sm px-3 py-2 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-700 focus:border-brand-500'}`}>
              <option value="All">All Years</option>
              <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
            </select>
            {/* Semester filter */}
            <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)}
              className={`rounded-xl border text-sm px-3 py-2 outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-600 text-slate-200 focus:border-brand-400' : 'bg-white border-slate-200 text-slate-700 focus:border-brand-500'}`}>
              <option value="All">All Semesters</option>
              <option>1st Semester</option><option>2nd Semester</option>
            </select>
            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button onClick={() => { setFilterProgram('All'); setFilterYear('All'); setFilterSemester('All'); setFilterSearch(''); }}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                Clear ({activeFilterCount})
              </button>
            )}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-brand-500/30 flex items-center text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Subject
            </button>
          </div>
        </div>
        {/* Results count */}
        {activeFilterCount > 0 && (
          <div className={`px-6 py-2 text-xs font-medium border-b ${dark ? 'text-slate-400 border-slate-700/60 bg-slate-800/40' : 'text-slate-500 border-slate-100 bg-slate-50/60'}`}>
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </div>
        )}

        {error && (
          <div className="m-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto relative">
          {isLoading ? (
            <div className={`absolute inset-0 flex items-center justify-center z-10 ${loadBg}`}>
              <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full py-12 ${subText}`}>
              <svg className={`w-16 h-16 mb-4 ${dark ? 'text-slate-700' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              {subjects.length === 0 ? (
                <><p className="text-lg font-medium">No subjects found</p><p className="text-sm">Click "Add Subject" to define your curriculum.</p></>
              ) : (
                <><p className="text-lg font-medium">No subjects match your filters</p><p className="text-sm">Try adjusting the program, year, or semester filters.</p></>
              )}
            </div>
          ) : (
            <CurriculumGrid
              subjects={filteredSubjects}
              dark={dark}
              boldText={boldText}
              subText={subText}
              onEdit={openEditModal}
              onDelete={handleDeleteSubject}
              onDetail={openDetailModal}
            />
          )}
        </div>
      </div>

      <AddSubjectModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchSubjects} 
      />

      {isEditModalOpen && selectedSubject && (
        <EditSubjectModal
          isOpen={isEditModalOpen}
          initialData={selectedSubject}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSubject(null);
          }}
          onSuccess={fetchSubjects}
        />
      )}

      {isDetailModalOpen && selectedSubject && (
        <SubjectDetailModal
          isOpen={isDetailModalOpen}
          subject={selectedSubject}
          allSchedules={schedules}
          students={students}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedSubject(null);
          }}
        />
      )}
    </div>
  );
};

export default InstructionModule;
