import React, { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  XMarkIcon,
  BookOpenIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const DAY_COLORS = {
  Monday:    'bg-blue-100 text-blue-700',
  Tuesday:   'bg-green-100 text-green-700',
  Wednesday: 'bg-yellow-100 text-yellow-700',
  Thursday:  'bg-purple-100 text-purple-700',
  Friday:    'bg-pink-100 text-pink-700',
  Saturday:  'bg-orange-100 text-orange-700',
};

const getDayColor = (day) => DAY_COLORS[day] || 'bg-slate-100 text-slate-700';

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const SubjectDetailModal = ({ isOpen, onClose, subject, allSchedules, students }) => {
  const dark = useDarkMode();
  const [activeTab, setActiveTab] = useState('faculty');

  // Theme tokens
  const modalBg  = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
  const headerBg = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const rowBg    = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';
  const tabActive   = dark ? 'text-brand-400 border-brand-400' : 'text-brand-600 border-brand-600';
  const tabInactive = dark ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-500 border-transparent hover:text-slate-700';
  const theadCls = dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500';
  const tbDivide = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const trHover  = dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';

  if (!isOpen || !subject) return null;

  // Schedules for this subject
  const subjectSchedules = (allSchedules || []).filter(
    s => String(s.subject_id) === String(subject.id)
  );

  // Unique faculty teaching this subject
  const facultyMap = {};
  subjectSchedules.forEach(s => {
    if (s.faculty && !facultyMap[s.faculty_id]) {
      facultyMap[s.faculty_id] = { ...s.faculty, schedules: [] };
    }
    if (s.faculty) facultyMap[s.faculty_id].schedules.push(s);
  });
  const facultyList = Object.values(facultyMap);

  // Unique sections taking this subject
  const sectionMap = {};
  subjectSchedules.forEach(s => {
    if (s.section && !sectionMap[s.section_id]) {
      sectionMap[s.section_id] = { ...s.section, schedule: s };
    }
  });
  const sectionList = Object.values(sectionMap);

  // Students in those sections
  const sectionNames = sectionList.map(sec => sec.section_name);
  const enrolledStudents = (students || []).filter(
    st => sectionNames.includes(st.section)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden ${modalBg}`}>

          {/* Header */}
          <div className={`p-6 border-b ${headerBg}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                  <BookOpenIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-brand-900/40 text-brand-300' : 'bg-brand-50 text-brand-600'}`}>
                      {subject.subject_code}
                    </span>
                    {subject.pre_requisites && (
                      <span className={`text-xs ${subText}`}>Pre-req: {subject.pre_requisites}</span>
                    )}
                  </div>
                  <h2 className={`text-lg font-bold mt-1 ${boldText}`}>{subject.descriptive_title}</h2>
                  <div className={`flex items-center gap-3 mt-0.5 text-xs ${subText}`}>
                    <span>Lec: {subject.lec_units} units</span>
                    <span>·</span>
                    <span>Lab: {subject.lab_units} units</span>
                    <span>·</span>
                    <span className="font-bold">Total: {subject.total_units} units</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
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
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">

            {/* ── Faculty POV ── */}
            {activeTab === 'faculty' && (
              <div className="space-y-4">
                <p className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${dark ? 'text-brand-400' : 'text-brand-600'}`}>
                  <span className={`w-4 h-px ${dark ? 'bg-brand-400' : 'bg-brand-500'}`} />
                  Faculty Teaching This Subject ({facultyList.length})
                </p>

                {facultyList.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-10 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                    <AcademicCapIcon className={`w-10 h-10 mb-3 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                    <p className={`font-semibold text-sm ${subText}`}>No faculty assigned yet</p>
                    <p className={`text-xs mt-1 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
                      Assign a schedule to link faculty to this subject.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {facultyList.map(f => (
                      <div key={f.id} className={`rounded-2xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                        {/* Faculty header */}
                        <div className={`flex items-center gap-3 p-4 ${rowBg}`}>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {f.first_name?.[0]}{f.last_name?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm ${boldText}`}>{f.first_name} {f.last_name}</p>
                            <p className={`text-xs ${dark ? 'text-orange-400' : 'text-orange-600'}`}>{f.position || 'Faculty'}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${dark ? 'bg-slate-700 text-slate-300' : 'bg-white border border-slate-200 text-slate-600'}`}>
                            {f.schedules.length} {f.schedules.length === 1 ? 'class' : 'classes'}
                          </span>
                        </div>
                        {/* Their schedules for this subject */}
                        <table className="w-full text-xs">
                          <thead className={`${theadCls}`}>
                            <tr>
                              <th className="px-4 py-2 text-left font-bold uppercase tracking-wider">Day & Time</th>
                              <th className="px-4 py-2 text-left font-bold uppercase tracking-wider">Section</th>
                              <th className="px-4 py-2 text-left font-bold uppercase tracking-wider">Room</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${tbDivide}`}>
                            {f.schedules.map(s => (
                              <tr key={s.id} className={`transition-colors ${trHover}`}>
                                <td className="px-4 py-2.5">
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold w-fit ${getDayColor(s.day_of_week)}`}>
                                      {s.day_of_week}
                                    </span>
                                    <span className={`font-mono ${subText}`}>
                                      {formatTime(s.start_time)} – {formatTime(s.end_time)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className={`font-medium px-2 py-0.5 rounded-lg border ${dark ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
                                    {s.section?.section_name}
                                  </span>
                                </td>
                                <td className={`px-4 py-2.5 ${subText}`}>{s.room}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Student POV ── */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-xl border text-center ${rowBg}`}>
                    <p className={`text-2xl font-bold ${boldText}`}>{enrolledStudents.length}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${subText}`}>Total Students</p>
                  </div>
                  <div className={`p-3 rounded-xl border text-center ${rowBg}`}>
                    <p className={`text-2xl font-bold ${boldText}`}>{sectionList.length}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${subText}`}>Sections</p>
                  </div>
                  <div className={`p-3 rounded-xl border text-center ${rowBg}`}>
                    <p className={`text-2xl font-bold ${boldText}`}>{facultyList.length}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${subText}`}>Instructors</p>
                  </div>
                </div>

                {/* Per-section breakdown */}
                {sectionList.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-10 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                    <UserGroupIcon className={`w-10 h-10 mb-3 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                    <p className={`font-semibold text-sm ${subText}`}>No sections assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sectionList.map(sec => {
                      const secStudents = enrolledStudents.filter(st => st.section === sec.section_name);
                      return (
                        <div key={sec.id} className={`rounded-2xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                          {/* Section header */}
                          <div className={`flex items-center gap-3 p-4 ${rowBg}`}>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                              <UserGroupIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className={`font-bold text-sm ${boldText}`}>{sec.section_name}</p>
                              <p className={`text-xs ${subText}`}>
                                {sec.course?.course_code || 'N/A'} · {sec.year_level} · {sec.semester}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-xs ${subText}`}>Instructor</p>
                              <p className={`text-xs font-semibold ${boldText}`}>
                                {sec.schedule?.faculty
                                  ? `${sec.schedule.faculty.first_name} ${sec.schedule.faculty.last_name}`
                                  : 'N/A'}
                              </p>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${dark ? 'bg-slate-700 text-slate-300' : 'bg-white border border-slate-200 text-slate-600'}`}>
                              {secStudents.length} students
                            </span>
                          </div>

                          {secStudents.length > 0 ? (
                            <table className="w-full text-xs">
                              <thead className={`${theadCls}`}>
                                <tr>
                                  <th className="px-4 py-2 text-left font-bold uppercase tracking-wider">Student</th>
                                  <th className="px-4 py-2 text-left font-bold uppercase tracking-wider hidden sm:table-cell">Student No.</th>
                                  <th className="px-4 py-2 text-left font-bold uppercase tracking-wider">Type</th>
                                </tr>
                              </thead>
                              <tbody className={`divide-y ${tbDivide}`}>
                                {secStudents.map(s => (
                                  <tr key={s.id} className={`transition-colors ${trHover}`}>
                                    <td className="px-4 py-2.5">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                                          {s.first_name?.[0]}{s.last_name?.[0]}
                                        </div>
                                        <p className={`font-semibold ${boldText}`}>{s.first_name} {s.last_name}</p>
                                      </div>
                                    </td>
                                    <td className={`px-4 py-2.5 hidden sm:table-cell font-mono ${subText}`}>
                                      {s.student_number || `#${s.id}`}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                                        s.student_type === 'Regular'
                                          ? (dark ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700')
                                          : (dark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700')
                                      }`}>{s.student_type}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className={`px-4 py-4 text-center text-xs ${subText}`}>
                              No students matched for this section.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

export default SubjectDetailModal;
