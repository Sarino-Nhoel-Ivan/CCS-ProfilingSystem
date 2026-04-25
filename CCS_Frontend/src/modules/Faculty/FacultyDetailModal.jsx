import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_COLORS = {
  Monday: 'bg-blue-100 text-blue-700', Tuesday: 'bg-green-100 text-green-700',
  Wednesday: 'bg-yellow-100 text-yellow-700', Thursday: 'bg-purple-100 text-purple-700',
  Friday: 'bg-pink-100 text-pink-700', Saturday: 'bg-orange-100 text-orange-700',
};
const fmtTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const FacultyDetailModal = ({ isOpen, onClose, faculty, allSchedules = [] }) => {
  const dark = useDarkMode();
  const [activeTab, setActiveTab] = useState('info');

  // Reset tab when faculty changes
  useEffect(() => { if (isOpen) setActiveTab('info'); }, [isOpen, faculty?.id]);

  if (!isOpen || !faculty) return null;

  // Schedules for this faculty
  const mySchedules = allSchedules
    .filter(s => String(s.faculty_id) === String(faculty.id))
    .sort((a, b) => DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week) || a.start_time.localeCompare(b.start_time));

  const modalBg  = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'border-slate-700/60' : 'border-slate-100';
  const rowBg    = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';

  const statusStyle = faculty.employment_status === 'Full-Time'
    ? (dark ? 'bg-green-900/40 text-green-300 border-green-800/50' : 'bg-green-100 text-green-700 border-green-200')
    : faculty.employment_status === 'Part-Time'
    ? (dark ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800/50' : 'bg-yellow-100 text-yellow-700 border-yellow-200')
    : (dark ? 'bg-blue-900/40 text-blue-300 border-blue-800/50' : 'bg-blue-100 text-blue-700 border-blue-200');

  const InfoRow = ({ icon, label, value, highlight }) => (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${rowBg}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-500 shadow-sm border border-slate-100'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${subText}`}>{label}</p>
        <p className={`text-sm font-semibold truncate ${highlight ? (dark ? 'text-orange-400' : 'text-orange-600') : boldText}`}>{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
        <div className={`relative transform overflow-hidden rounded-2xl text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border ${modalBg}`}>

          {/* Hero banner */}
          <div className={`relative px-6 pt-6 pb-5 border-b ${divider} ${dark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-orange-50/60 to-white'}`}>
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-orange-500/30">
                  {faculty.first_name?.[0]}{faculty.last_name?.[0]}
                </div>
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${dark ? 'border-slate-800' : 'border-white'} ${faculty.employment_status === 'Full-Time' ? 'bg-green-500' : 'bg-yellow-400'}`} />
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <h2 className={`text-xl font-extrabold tracking-tight truncate ${boldText}`}>
                  {faculty.first_name} {faculty.middle_name ? faculty.middle_name[0] + '. ' : ''}{faculty.last_name}
                </h2>
                <p className={`text-sm font-semibold ${dark ? 'text-orange-400' : 'text-orange-500'}`}>{faculty.position || 'N/A'}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-xs ${subText}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {faculty.department?.department_name || 'No Department'}
                  </span>
                  <span className={`text-xs ${dark ? 'text-slate-600' : 'text-slate-300'}`}>·</span>
                  <span className={`text-xs font-mono ${subText}`}>ID #{faculty.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b px-6 ${dark ? 'border-slate-700/60' : 'border-slate-200'}`}>
            {[
              { id: 'info', label: 'Information' },
              { id: 'subjects', label: `Subjects (${mySchedules.length})` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? (dark ? 'text-orange-400 border-orange-400' : 'text-orange-500 border-orange-500')
                    : (dark ? 'text-slate-400 border-transparent hover:text-slate-200' : 'text-slate-500 border-transparent hover:text-slate-700')
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto max-h-[55vh]">

            {/* ── Info Tab ── */}
            {activeTab === 'info' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Personal */}
                  <div className="space-y-3">
                    <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>
                      <span className="w-4 h-px bg-orange-400" />Personal Information
                    </p>
                    <InfoRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                      label="Gender" value={faculty.gender} />
                    <InfoRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                      label="Date of Birth"
                      value={faculty.date_of_birth
                        ? new Date(faculty.date_of_birth.replace ? faculty.date_of_birth.replace(' ','T') : faculty.date_of_birth)
                            .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'N/A'} />
                    <InfoRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                      label="Email Address" value={faculty.email} highlight />
                    <InfoRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                      label="Contact Number" value={faculty.contact_number} />
                  </div>

                  {/* Employment */}
                  <div className="space-y-3">
                    <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>
                      <span className="w-4 h-px bg-orange-400" />Employment Details
                    </p>
                    <div className={`flex items-start gap-3 p-3 rounded-xl border ${rowBg}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-slate-700 text-slate-400' : 'bg-white text-slate-500 shadow-sm border border-slate-100'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${subText}`}>Employment Status</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
                          {faculty.employment_status === 'Full-Time' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                          {faculty.employment_status}
                        </span>
                      </div>
                    </div>
                    <InfoRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                      label="Date Hired" value={faculty.hire_date ? new Date(faculty.hire_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
                    <InfoRow icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      label="Office Location" value={faculty.office_location} />
                  </div>
                </div>

                {/* Consultation Hours */}
                <div className={`mt-4 p-4 rounded-xl border ${dark ? 'bg-amber-900/20 border-amber-700/40' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${dark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${dark ? 'text-amber-400' : 'text-amber-600'}`}>Consultation Hours</p>
                      <p className={`text-sm font-semibold ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
                        {faculty.office_hours || 'No consultation hours set. Contact the faculty directly.'}
                      </p>
                      <p className={`text-xs mt-1 ${dark ? 'text-amber-500' : 'text-amber-600'}`}>
                        Visit the CCS office during these hours for transactions with this faculty.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Subjects Tab ── */}
            {activeTab === 'subjects' && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Loads', value: mySchedules.length },
                    { label: 'Unique Subjects', value: new Set(mySchedules.map(s => s.subject_id)).size },
                    { label: 'Sections', value: new Set(mySchedules.map(s => s.section_id)).size },
                  ].map(({ label, value }) => (
                    <div key={label} className={`p-3 rounded-xl border text-center ${rowBg}`}>
                      <p className={`text-xl font-bold ${boldText}`}>{value}</p>
                      <p className={`text-xs font-semibold mt-0.5 ${subText}`}>{label}</p>
                    </div>
                  ))}
                </div>

                {mySchedules.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-10 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                    <svg className={`w-10 h-10 mb-3 ${dark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className={`font-semibold text-sm ${subText}`}>No subjects assigned yet</p>
                    <p className={`text-xs mt-1 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Assign schedules in the Scheduling tab.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mySchedules.map(s => (
                      <div key={s.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${dark ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        {/* Day badge */}
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ${DAY_COLORS[s.day_of_week] || 'bg-slate-100 text-slate-700'}`}>
                          {s.day_of_week?.slice(0, 3)}
                        </span>
                        {/* Time */}
                        <span className={`text-xs font-mono font-semibold shrink-0 ${subText}`}>
                          {fmtTime(s.start_time)}–{fmtTime(s.end_time)}
                        </span>
                        {/* Subject */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${boldText}`}>
                            <span className={`mr-1.5 ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{s.subject?.subject_code}</span>
                            {s.subject?.descriptive_title}
                          </p>
                        </div>
                        {/* Section + Room */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dark ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
                            {s.section?.section_name}
                          </span>
                          <span className={`text-[10px] ${subText}`}>{s.room}</span>
                        </div>
                      </div>
                    ))}
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

export default FacultyDetailModal;
