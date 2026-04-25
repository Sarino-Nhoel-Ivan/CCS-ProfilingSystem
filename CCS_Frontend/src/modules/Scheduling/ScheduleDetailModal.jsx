import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  XMarkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const DAY_COLORS = {
  Monday:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Tuesday:   'bg-green-100 text-green-700',
  Wednesday: 'bg-yellow-100 text-yellow-700',
  Thursday:  'bg-purple-100 text-purple-700',
  Friday:    'bg-pink-100 text-pink-700',
  Saturday:  'bg-orange-100 text-orange-700',
};

const getDayColor = (day) =>
  DAY_COLORS[day] || 'bg-slate-100 text-slate-700';

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const ScheduleDetailModal = ({ isOpen, onClose, schedule, allSchedules, students }) => {
  const dark = useDarkMode();
  const [activeTab, setActiveTab] = useState('faculty');
  const [sectionStudents, setSectionStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Theme tokens
  const modalBg  = dark ? 'bg-slate-900 border-slate-700/60'  : 'bg-white border-slate-200';
  const headerBg = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'border-slate-700/60' : 'border-slate-100';
  const rowBg    = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';
  const tabActive = dark ? 'text-brand-400 border-brand-400' : 'text-brand-600 border-brand-600';
  const tabInactive = dark ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-500 border-transparent hover:text-slate-700';
  const theadCls = dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500';
  const tbDivide = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const trHover  = dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';

  useEffect(() => {
    if (!isOpen || !schedule) return;
    setActiveTab('faculty');
    // Filter students by section
    if (students && schedule.section_id) {
      setLoadingStudents(true);
      const filtered = students.filter(
        s => s.section === schedule.section?.section_name ||
             String(s.section_id) === String(schedule.section_id)
      );
      setSectionStudents(filtered);
      setLoadingStudents(false);
    }
  }, [isOpen, schedule, students]);

  if (!isOpen || !schedule) return null;

  // All schedules for this faculty member
  const facultySchedules = (allSchedules || []).filter(
    s => String(s.faculty_id) === String(schedule.faculty_id)
  ).sort((a, b) => {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const di = days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week);
    if (di !== 0) return di;
    return a.start_time.localeCompare(b.start_time);
  });

  const faculty = schedule.faculty;
  const section = schedule.section;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden ${modalBg}`}>

          {/* Header */}
          <div className={`flex items-start justify-between p-6 border-b ${headerBg}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                <CalendarDaysIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${boldText}`}>
                  {schedule.subject?.subject_code} — {schedule.subject?.descriptive_title}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${getDayColor(schedule.day_of_week)}`}>
                    {schedule.day_of_week}
                  </span>
                  <span className={`text-xs font-mono ${subText}`}>
                    {formatTime(schedule.start_time)} – {formatTime(schedule.end_time)}
                  </span>
                  <span className={`text-xs flex items-center gap-1 ${subText}`}>
                    <MapPinIcon className="w-3 h-3" />{schedule.room}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className={`flex border-b px-6 ${dark ? 'border-slate-700/60' : 'border-slate-200'}`}>
            {[
              { id: 'faculty', label: 'Faculty POV', icon: AcademicCapIcon },
              { id: 'students', label: 'Student POV', icon: UserGroupIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === id ? tabActive : tabInactive}`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">

            {/* ── Faculty POV ── */}
            {activeTab === 'faculty' && (
              <div className="space-y-5">
                {/* Faculty profile card */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl border ${rowBg}`}>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {faculty?.first_name?.[0]}{faculty?.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base ${boldText}`}>
                      {faculty?.first_name} {faculty?.middle_name ? faculty.middle_name[0] + '. ' : ''}{faculty?.last_name}
                    </p>
                    <p className={`text-sm ${dark ? 'text-orange-400' : 'text-orange-600'}`}>{faculty?.position || 'Faculty'}</p>
                    <div className={`flex items-center gap-3 mt-1 text-xs ${subText}`}>
                      <span className="flex items-center gap-1">
                        <BuildingOfficeIcon className="w-3.5 h-3.5" />
                        {faculty?.department?.department_name || 'N/A'}
                      </span>
                      {faculty?.email && (
                        <span>· {faculty.email}</span>
                      )}
                    </div>
                  </div>
                  <div className={`text-right shrink-0`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>Total Loads</p>
                    <p className={`text-2xl font-bold ${boldText}`}>{facultySchedules.length}</p>
                  </div>
                </div>

                {/* Faculty's full timetable */}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${dark ? 'text-brand-400' : 'text-brand-600'}`}>
                    <span className={`w-4 h-px ${dark ? 'bg-brand-400' : 'bg-brand-500'}`} />
                    Full Teaching Schedule
                  </p>
                  {facultySchedules.length > 0 ? (
                    <div className={`rounded-xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <table className="w-full text-sm">
                        <thead className={`text-xs uppercase tracking-wider ${theadCls}`}>
                          <tr>
                            <th className="px-4 py-3 text-left font-bold">Day & Time</th>
                            <th className="px-4 py-3 text-left font-bold">Subject</th>
                            <th className="px-4 py-3 text-left font-bold">Section</th>
                            <th className="px-4 py-3 text-left font-bold">Room</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${tbDivide}`}>
                          {facultySchedules.map(s => (
                            <tr key={s.id}
                              className={`transition-colors ${trHover} ${String(s.id) === String(schedule.id) ? (dark ? 'bg-brand-900/20' : 'bg-brand-50') : ''}`}>
                              <td className="px-4 py-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold w-fit ${getDayColor(s.day_of_week)}`}>
                                    {s.day_of_week}
                                  </span>
                                  <span className={`text-xs font-mono ${subText}`}>
                                    {formatTime(s.start_time)} – {formatTime(s.end_time)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <p className={`font-semibold text-xs ${boldText}`}>{s.subject?.subject_code}</p>
                                <p className={`text-xs truncate max-w-[160px] ${subText}`}>{s.subject?.descriptive_title}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${dark ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
                                  {s.section?.section_name}
                                </span>
                              </td>
                              <td className={`px-4 py-3 text-xs font-medium ${subText}`}>{s.room}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center py-8 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                      <CalendarDaysIcon className={`w-8 h-8 mb-2 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                      <p className={`text-xs ${subText}`}>No schedules found for this faculty</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Student POV ── */}
            {activeTab === 'students' && (
              <div className="space-y-5">
                {/* Section info card */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl border ${rowBg}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                    <UserGroupIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${boldText}`}>{section?.section_name}</p>
                    <p className={`text-sm ${subText}`}>
                      {section?.course?.course_code || section?.course?.course_name || 'N/A'} · {section?.year_level} · {section?.semester}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${subText}`}>Students</p>
                    <p className={`text-2xl font-bold ${boldText}`}>{sectionStudents.length}</p>
                  </div>
                </div>

                {/* Student list */}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 ${dark ? 'text-teal-400' : 'text-teal-600'}`}>
                    <span className={`w-4 h-px ${dark ? 'bg-teal-400' : 'bg-teal-500'}`} />
                    Students in {section?.section_name}
                  </p>
                  {loadingStudents ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
                    </div>
                  ) : sectionStudents.length > 0 ? (
                    <div className={`rounded-xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <table className="w-full text-sm">
                        <thead className={`text-xs uppercase tracking-wider ${theadCls}`}>
                          <tr>
                            <th className="px-4 py-3 text-left font-bold">Student</th>
                            <th className="px-4 py-3 text-left font-bold hidden sm:table-cell">Student No.</th>
                            <th className="px-4 py-3 text-left font-bold hidden md:table-cell">Year Level</th>
                            <th className="px-4 py-3 text-left font-bold">Type</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${tbDivide}`}>
                          {sectionStudents.map(s => (
                            <tr key={s.id} className={`transition-colors ${trHover}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                                    {s.first_name?.[0]}{s.last_name?.[0]}
                                  </div>
                                  <div>
                                    <p className={`font-semibold text-xs ${boldText}`}>{s.first_name} {s.last_name}</p>
                                    <p className={`text-xs ${subText}`}>{s.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className={`px-4 py-3 hidden sm:table-cell text-xs font-mono ${subText}`}>
                                {s.student_number || `#${s.id}`}
                              </td>
                              <td className={`px-4 py-3 hidden md:table-cell text-xs ${subText}`}>{s.year_level}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  s.student_type === 'Regular'
                                    ? (dark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700')
                                    : (dark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700')
                                }`}>{s.student_type}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center py-8 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                      <UserGroupIcon className={`w-8 h-8 mb-2 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                      <p className={`text-xs ${subText}`}>No students found for this section</p>
                      <p className={`text-xs mt-1 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
                        Students are matched by section name
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-3 flex justify-end border-t ${dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
            <button onClick={onClose}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${dark ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailModal;
