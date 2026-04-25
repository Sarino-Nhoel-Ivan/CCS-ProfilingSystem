import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../utils/api';
import AssignScheduleModal from './AssignScheduleModal';
import EditScheduleModal from './EditScheduleModal';
import ScheduleDetailModal from './ScheduleDetailModal';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  CalendarDaysIcon, UserGroupIcon, AcademicCapIcon, BuildingOfficeIcon,
  ClockIcon, MapPinIcon, PlusIcon, PencilSquareIcon, TrashIcon,
  MagnifyingGlassIcon, FunnelIcon, XMarkIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_COLORS = {
  Monday:    { badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'   },
  Tuesday:   { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500'  },
  Wednesday: { badge: 'bg-yellow-100 text-yellow-700',dot: 'bg-yellow-500'},
  Thursday:  { badge: 'bg-purple-100 text-purple-700',dot: 'bg-purple-500'},
  Friday:    { badge: 'bg-pink-100 text-pink-700',   dot: 'bg-pink-500'   },
  Saturday:  { badge: 'bg-orange-100 text-orange-700',dot: 'bg-orange-500'},
};
const getDayColor = (day) => DAY_COLORS[day] || { badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' };

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const SchedulingModule = ({ students = [], faculties = [] }) => {
  const dark = useDarkMode();

  // ── theme tokens ──────────────────────────────────────────────────────────
  const card     = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const rowHover = dark ? 'hover:bg-slate-800 cursor-pointer' : 'hover:bg-slate-50 cursor-pointer';
  const thead    = dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500';
  const tbDivide = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const inputCls = dark
    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-brand-400'
    : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-brand-500';
  const selectCls = dark
    ? 'bg-slate-800 border-slate-600 text-slate-200 focus:border-brand-400'
    : 'bg-white border-slate-200 text-slate-700 focus:border-brand-500';

  // ── state ─────────────────────────────────────────────────────────────────
  const [schedules, setSchedules]         = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState(null);
  const [activeView, setActiveView]       = useState('timetable'); // 'timetable' | 'by-section' | 'by-faculty'
  const [filterDay, setFilterDay]         = useState('All');
  const [filterSection, setFilterSection] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');
  const [search, setSearch]               = useState('');
  const [isAddModalOpen, setIsAddModalOpen]       = useState(false);
  const [isEditModalOpen, setIsEditModalOpen]     = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule]   = useState(null);

  useEffect(() => { fetchSchedules(); }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const data = await api.schedules.getAll();
      setSchedules(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load schedules.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try { await api.schedules.delete(id); fetchSchedules(); }
    catch (err) { alert(err.message || 'Failed to delete schedule'); }
  };

  // ── derived stats ─────────────────────────────────────────────────────────
  const uniqueSections = useMemo(() => [...new Set(schedules.map(s => s.section?.section_name).filter(Boolean))].sort(), [schedules]);
  const uniqueFaculties = useMemo(() => [...new Set(schedules.map(s => s.faculty_id))].length, [schedules]);
  const uniqueRooms     = useMemo(() => new Set(schedules.map(s => s.room)).size, [schedules]);
  const uniqueSubjects  = useMemo(() => new Set(schedules.map(s => s.subject_id)).size, [schedules]);

  // Day load distribution
  const dayLoad = useMemo(() => DAYS.map(d => ({
    day: d, count: schedules.filter(s => s.day_of_week === d).length,
  })), [schedules]);
  const maxDayLoad = Math.max(...dayLoad.map(d => d.count), 1);

  // ── filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => schedules.filter(s => {
    const matchDay     = filterDay === 'All' || s.day_of_week === filterDay;
    const matchSection = !filterSection || s.section?.section_name === filterSection;
    const matchFaculty = !filterFaculty || String(s.faculty_id) === filterFaculty;
    const matchSearch  = !search || [
      s.subject?.subject_code, s.subject?.descriptive_title,
      s.faculty?.first_name, s.faculty?.last_name, s.section?.section_name, s.room,
    ].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchDay && matchSection && matchFaculty && matchSearch;
  }), [schedules, filterDay, filterSection, filterFaculty, search]);

  // ── grouped by section (for by-section view) ──────────────────────────────
  const bySection = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      const key = s.section?.section_name || 'Unassigned';
      if (!map[key]) map[key] = { section: s.section, schedules: [] };
      map[key].schedules.push(s);
    });
    return Object.values(map).sort((a, b) => (a.section?.section_name || '').localeCompare(b.section?.section_name || ''));
  }, [filtered]);

  // ── grouped by faculty (for by-faculty view) ──────────────────────────────
  const byFaculty = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      const key = s.faculty_id || 'unassigned';
      if (!map[key]) map[key] = { faculty: s.faculty, schedules: [] };
      map[key].schedules.push(s);
    });
    return Object.values(map).sort((a, b) => {
      const na = `${a.faculty?.last_name} ${a.faculty?.first_name}`;
      const nb = `${b.faculty?.last_name} ${b.faculty?.first_name}`;
      return na.localeCompare(nb);
    });
  }, [filtered]);

  // ── timetable grouped by day ───────────────────────────────────────────────
  const byDay = useMemo(() => DAYS.map(day => ({
    day,
    schedules: filtered.filter(s => s.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  })).filter(d => d.schedules.length > 0), [filtered]);

  // ── schedule row component ─────────────────────────────────────────────────
  const ScheduleRow = ({ s, showDay = false }) => (
    <tr onClick={() => { setSelectedSchedule(s); setIsDetailModalOpen(true); }}
      className={`transition-colors ${rowHover}`}>
      {showDay && (
        <td className="px-4 py-3">
          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${getDayColor(s.day_of_week).badge}`}>
            {s.day_of_week}
          </span>
        </td>
      )}
      <td className="px-4 py-3">
        <span className={`text-xs font-mono font-semibold ${subText}`}>
          {formatTime(s.start_time)} – {formatTime(s.end_time)}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className={`font-bold text-sm ${boldText}`}>{s.subject?.subject_code}</p>
        <p className={`text-xs truncate max-w-[180px] ${subText}`}>{s.subject?.descriptive_title}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${dark ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
            {s.faculty?.first_name?.[0]}{s.faculty?.last_name?.[0]}
          </div>
          <span className={`text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
            {s.faculty?.first_name} {s.faculty?.last_name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${dark ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
          {s.section?.section_name}
        </span>
      </td>
      <td className={`px-4 py-3 text-sm font-medium ${subText}`}>
        <div className="flex items-center gap-1">
          <MapPinIcon className="w-3.5 h-3.5 opacity-60 shrink-0" />
          {s.room}
        </div>
      </td>
      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end gap-1">
          <button onClick={() => { setSelectedSchedule(s); setIsEditModalOpen(true); }}
            className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-brand-400 hover:bg-brand-500/10' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'}`}>
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(s.id)}
            className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  const TableHead = ({ showDay = false }) => (
    <thead className={`text-xs uppercase tracking-wider ${thead}`}>
      <tr>
        {showDay && <th className="px-4 py-3 text-left font-bold">Day</th>}
        <th className="px-4 py-3 text-left font-bold">Time</th>
        <th className="px-4 py-3 text-left font-bold">Subject</th>
        <th className="px-4 py-3 text-left font-bold">Faculty</th>
        <th className="px-4 py-3 text-left font-bold">Section</th>
        <th className="px-4 py-3 text-left font-bold">Room</th>
        <th className="px-4 py-3 text-right font-bold">Actions</th>
      </tr>
    </thead>
  );

  return (
    <div className="space-y-6">

      {/* ── Hero Header ── */}
      <div className={`relative rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${card}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-teal-500/5 pointer-events-none" />
        <div className="relative p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
              <CalendarDaysIcon className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${dark ? 'text-brand-400' : 'text-brand-600'}`}>CCS Profiling System</p>
              <h1 className={`text-xl font-extrabold tracking-tight ${boldText}`}>Class Scheduling</h1>
              <p className={`text-xs mt-0.5 ${subText}`}>Assign subjects, faculty, and rooms to sections by semester.</p>
            </div>
          </div>
          <button onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-brand-500/30 shrink-0">
            <PlusIcon className="w-4 h-4" />Assign Schedule
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Schedules', value: schedules.length, icon: CalendarDaysIcon, accent: 'border-l-brand-500', iconBg: dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-600' },
          { label: 'Sections Covered', value: uniqueSections.length, icon: UserGroupIcon, accent: 'border-l-teal-500', iconBg: dark ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-50 text-teal-600' },
          { label: 'Faculty Assigned', value: uniqueFaculties, icon: AcademicCapIcon, accent: 'border-l-orange-500', iconBg: dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500' },
          { label: 'Rooms Utilized', value: uniqueRooms, icon: BuildingOfficeIcon, accent: 'border-l-violet-500', iconBg: dark ? 'bg-violet-900/40 text-violet-400' : 'bg-violet-50 text-violet-600' },
        ].map(({ label, value, icon: Icon, accent, iconBg }) => (
          <div key={label} className={`p-5 rounded-2xl border-l-4 border shadow-sm flex items-center gap-4 transition-colors duration-300 ${accent} ${card}`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}><Icon className="w-5 h-5" /></div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${boldText}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Day Load Chart ── */}
      <div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
        <div className="flex items-center gap-2 mb-5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
            <ChartBarIcon className="w-4 h-4" />
          </div>
          <h2 className={`text-sm font-bold ${boldText}`}>Schedule Load by Day</h2>
          <span className={`ml-auto text-xs ${subText}`}>{schedules.length} total classes</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {dayLoad.map(({ day, count }) => {
            const pct = maxDayLoad > 0 ? Math.round((count / maxDayLoad) * 100) : 0;
            const dc = getDayColor(day);
            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <span className={`text-xs font-bold ${boldText}`}>{count}</span>
                <div className={`w-full rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`} style={{ height: '60px', display: 'flex', alignItems: 'flex-end' }}>
                  <div className={`w-full rounded-full transition-all duration-700 ${dc.dot.replace('bg-', 'bg-')}`}
                    style={{ height: `${Math.max(pct, 4)}%`, background: undefined }}
                    className={`w-full rounded-t-full transition-all duration-700 ${dc.dot}`} />
                </div>
                <span className={`text-[10px] font-semibold ${subText}`}>{day.slice(0, 3)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors duration-300 ${card}`}>

        {/* Toolbar */}
        <div className={`p-4 border-b flex flex-wrap items-center gap-3 ${dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/50 border-slate-100'}`}>
          {/* View tabs */}
          <div className={`flex rounded-xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
            {[
              { id: 'timetable',  label: 'By Day' },
              { id: 'by-section', label: 'By Section' },
              { id: 'by-faculty', label: 'By Faculty' },
            ].map(v => (
              <button key={v.id} onClick={() => setActiveView(v.id)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${activeView === v.id
                  ? 'bg-brand-600 text-white'
                  : dark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search subject, faculty, section, room..."
              className={`w-full pl-9 pr-8 py-2 rounded-xl border text-sm outline-none transition-colors ${inputCls}`} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <XMarkIcon className={`w-4 h-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`} />
              </button>
            )}
          </div>

          {/* Day filter */}
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)}
            className={`rounded-xl border text-sm px-3 py-2 outline-none transition-colors ${selectCls}`}>
            <option value="All">All Days</option>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>

          {/* Section filter */}
          <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
            className={`rounded-xl border text-sm px-3 py-2 outline-none transition-colors ${selectCls}`}>
            <option value="">All Sections</option>
            {uniqueSections.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Results count */}
          <span className={`ml-auto text-xs font-semibold ${subText}`}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {error && <div className="m-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">{error}</div>}

        {/* Content */}
        <div className="overflow-x-auto max-h-[calc(100vh-520px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className={`w-10 h-10 border-4 rounded-full animate-spin ${dark ? 'border-slate-700 border-t-brand-500' : 'border-slate-200 border-t-brand-600'}`} />
            </div>
          ) : filtered.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-16 ${subText}`}>
              <CalendarDaysIcon className={`w-14 h-14 mb-3 ${dark ? 'text-slate-700' : 'text-slate-300'}`} />
              <p className="text-base font-semibold">No schedules found</p>
              <p className="text-sm mt-1">{schedules.length === 0 ? 'Click "Assign Schedule" to get started.' : 'Try adjusting your filters.'}</p>
            </div>
          ) : activeView === 'timetable' ? (
            /* ── By Day view ── */
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {byDay.map(({ day, schedules: ds }) => (
                <div key={day}>
                  {/* Day header */}
                  <div className={`flex items-center gap-3 px-4 py-2.5 sticky top-0 z-10 ${dark ? 'bg-slate-800/90' : 'bg-slate-50/90'} backdrop-blur-sm`}>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getDayColor(day).badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getDayColor(day).dot}`} />
                      {day}
                    </span>
                    <span className={`text-xs font-semibold ${subText}`}>{ds.length} class{ds.length !== 1 ? 'es' : ''}</span>
                  </div>
                  <table className="w-full text-sm min-w-[700px]">
                    <TableHead />
                    <tbody className={`divide-y ${tbDivide}`}>
                      {ds.map(s => <ScheduleRow key={s.id} s={s} />)}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : activeView === 'by-section' ? (
            /* ── By Section view ── */
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {bySection.map(({ section, schedules: ds }) => (
                <div key={section?.id || 'unassigned'}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 sticky top-0 z-10 ${dark ? 'bg-slate-800/90' : 'bg-slate-50/90'} backdrop-blur-sm`}>
                    <UserGroupIcon className={`w-4 h-4 ${dark ? 'text-teal-400' : 'text-teal-600'}`} />
                    <span className={`text-sm font-bold ${boldText}`}>{section?.section_name || 'Unassigned'}</span>
                    {section && <span className={`text-xs ${subText}`}>{section.year_level} · {section.semester}</span>}
                    <span className={`ml-auto text-xs font-semibold ${subText}`}>{ds.length} subject{ds.length !== 1 ? 's' : ''}</span>
                  </div>
                  <table className="w-full text-sm min-w-[700px]">
                    <TableHead showDay />
                    <tbody className={`divide-y ${tbDivide}`}>
                      {ds.sort((a, b) => DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week))
                         .map(s => <ScheduleRow key={s.id} s={s} showDay />)}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            /* ── By Faculty view ── */
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {byFaculty.map(({ faculty, schedules: ds }) => (
                <div key={faculty?.id || 'unassigned'}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 sticky top-0 z-10 ${dark ? 'bg-slate-800/90' : 'bg-slate-50/90'} backdrop-blur-sm`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${dark ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                      {faculty?.first_name?.[0]}{faculty?.last_name?.[0]}
                    </div>
                    <span className={`text-sm font-bold ${boldText}`}>{faculty?.first_name} {faculty?.last_name}</span>
                    <span className={`text-xs ${dark ? 'text-orange-400' : 'text-orange-600'}`}>{faculty?.position}</span>
                    <span className={`ml-auto text-xs font-semibold ${subText}`}>{ds.length} load{ds.length !== 1 ? 's' : ''}</span>
                  </div>
                  <table className="w-full text-sm min-w-[700px]">
                    <TableHead showDay />
                    <tbody className={`divide-y ${tbDivide}`}>
                      {ds.sort((a, b) => DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week))
                         .map(s => <ScheduleRow key={s.id} s={s} showDay />)}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <AssignScheduleModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchSchedules} />

      {isEditModalOpen && selectedSchedule && (
        <EditScheduleModal isOpen={isEditModalOpen} initialData={selectedSchedule}
          onClose={() => { setIsEditModalOpen(false); setSelectedSchedule(null); }}
          onSuccess={fetchSchedules} />
      )}

      {isDetailModalOpen && selectedSchedule && (
        <ScheduleDetailModal isOpen={isDetailModalOpen} schedule={selectedSchedule}
          allSchedules={schedules} students={students}
          onClose={() => { setIsDetailModalOpen(false); setSelectedSchedule(null); }} />
      )}
    </div>
  );
};

export default SchedulingModule;
