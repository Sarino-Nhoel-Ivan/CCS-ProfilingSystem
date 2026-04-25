import { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { STORAGE_URL } from '../../utils/config';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_COLORS = {
  Monday:    'bg-blue-100 text-blue-700',
  Tuesday:   'bg-green-100 text-green-700',
  Wednesday: 'bg-yellow-100 text-yellow-700',
  Thursday:  'bg-purple-100 text-purple-700',
  Friday:    'bg-pink-100 text-pink-700',
  Saturday:  'bg-orange-100 text-orange-700',
};
const fmtTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

// ── Faculty Avatar (large, for profile header) ────────────────────────────
const FacultyAvatarLarge = ({ faculty: f, dark }) => {
  const [imgError, setImgError] = useState(false);
  const initials = `${f.first_name?.[0] ?? ''}${f.last_name?.[0] ?? ''}`;
  const photoSrc = f.profile_photo
    ? (f.profile_photo.startsWith('http') ? f.profile_photo : `${STORAGE_URL}/${f.profile_photo}`)
    : null;
  if (photoSrc && !imgError)
    return (
      <img
        src={photoSrc}
        alt={initials}
        className="w-20 h-20 rounded-2xl object-cover shadow-lg"
        onError={() => setImgError(true)}
      />
    );
  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-orange-500/30">
      {initials}
    </div>
  );
};

const FacultyProfileTabs = ({ activeTab, faculty, schedules = [], onEditClick, onDeleteClick }) => {
  const dark = useDarkMode();

  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'border-slate-700/60' : 'border-slate-100';
  const rowBg    = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';
  const valueRow = dark ? 'text-slate-200' : 'text-slate-800';
  const editBtn  = dark ? 'text-slate-300 bg-slate-700 hover:bg-slate-600' : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200';

  if (!faculty) return null;

  const statusStyle = faculty.employment_status === 'Full-Time'
    ? (dark ? 'bg-green-900/40 text-green-300 border-green-800/50' : 'bg-green-100 text-green-700 border-green-200')
    : faculty.employment_status === 'Part-Time'
    ? (dark ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800/50' : 'bg-yellow-100 text-yellow-700 border-yellow-200')
    : (dark ? 'bg-blue-900/40 text-blue-300 border-blue-800/50' : 'bg-blue-100 text-blue-700 border-blue-200');

  const mySchedules = schedules
    .filter(s => String(s.faculty_id) === String(faculty.id))
    .sort((a, b) => DAYS.indexOf(a.day_of_week) - DAYS.indexOf(b.day_of_week) || a.start_time.localeCompare(b.start_time));

  const Row = ({ label, value, highlight }) => (
    <div className={`flex items-center justify-between py-2.5 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
      <span className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-sm font-semibold ${highlight ? (dark ? 'text-orange-400' : 'text-orange-600') : valueRow}`}>{value || 'N/A'}</span>
    </div>
  );

  const cardCls = `rounded-2xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`;
  const sectionTitle = (label) => (
    <div className="px-5 pt-5 pb-1">
      <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>
        <span className="w-4 h-px bg-orange-400" />{label}
      </p>
    </div>
  );

  return (
    <div className={`p-6 rounded-2xl shadow-sm border min-h-[500px] transition-colors duration-300 ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>

      {/* ── Header ── */}
      <div className={`flex items-center gap-5 mb-8 pb-6 border-b ${divider}`}>
        <div className="relative shrink-0">
          <FacultyAvatarLarge faculty={faculty} dark={dark} />
          <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 ${dark ? 'border-slate-900' : 'border-white'} ${faculty.employment_status === 'Full-Time' ? 'bg-green-500' : 'bg-yellow-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`text-2xl font-extrabold tracking-tight truncate ${boldText}`}>
            {faculty.first_name} {faculty.middle_name ? faculty.middle_name[0] + '. ' : ''}{faculty.last_name}
          </h2>
          <p className={`text-sm font-semibold mt-0.5 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>{faculty.position || 'N/A'}</p>
          <div className={`flex flex-wrap items-center gap-3 mt-1.5 text-xs ${subText}`}>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              {faculty.department?.department_name || 'No Department'}
            </span>
            <span className={dark ? 'text-slate-600' : 'text-slate-300'}>·</span>
            <span className="font-mono">ID #{faculty.id}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
              {faculty.employment_status === 'Full-Time' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
              {faculty.employment_status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onEditClick(faculty)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl transition-colors ${editBtn}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </button>
          <button onClick={() => onDeleteClick(faculty.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl transition-colors ${dark ? 'text-red-400 bg-red-900/30 hover:bg-red-900/50' : 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-100'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete
          </button>
        </div>
      </div>

      {/* ── Personal Details Tab ── */}
      {activeTab === 'personal_details' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className={cardCls}>
              {sectionTitle('Personal Information')}
              <div className="px-5 pb-4">
                <Row label="Gender" value={faculty.gender} />
                <Row label="Date of Birth" value={faculty.date_of_birth
                  ? new Date((faculty.date_of_birth.replace ? faculty.date_of_birth.replace(' ','T') : faculty.date_of_birth))
                      .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : null} />
                <Row label="Nationality" value={faculty.nationality} />
                <Row label="Civil Status" value={faculty.civil_status} />
                <Row label="Email" value={faculty.email} highlight />
                <div className="flex items-center justify-between py-2.5">
                  <span className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Contact Number</span>
                  <span className={`text-sm font-semibold ${valueRow}`}>{faculty.contact_number || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className={cardCls}>
              {sectionTitle('Employment Details')}
              <div className="px-5 pb-4">
                <div className={`flex items-center justify-between py-2.5 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                  <span className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Employment Status</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${statusStyle}`}>
                    {faculty.employment_status === 'Full-Time' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                    {faculty.employment_status || 'N/A'}
                  </span>
                </div>
                <Row label="Position" value={faculty.position} />
                <Row label="Department" value={faculty.department?.department_name} />
                <Row label="Date Hired" value={faculty.hire_date
                  ? new Date(faculty.hire_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : null} />
                <div className="flex items-center justify-between py-2.5">
                  <span className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Office Location</span>
                  <span className={`text-sm font-semibold ${valueRow}`}>{faculty.office_location || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Hours — read-only for admin, editable only by faculty */}
          <div className={`rounded-2xl border p-5 ${dark ? 'bg-amber-900/20 border-amber-700/40' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-amber-400' : 'text-amber-600'}`}>Consultation Hours</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>Set by Faculty</span>
                </div>
                <p className={`text-sm font-semibold ${dark ? 'text-amber-200' : 'text-amber-900'}`}>
                  {faculty.office_hours || 'No consultation hours set. Contact the faculty directly.'}
                </p>
                <p className={`text-xs mt-1 ${dark ? 'text-amber-500' : 'text-amber-600'}`}>
                  Visit the CCS office during these hours for transactions with this faculty.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Subjects Tab ── */}
      {activeTab === 'subjects' && (
        <div className="space-y-5">
          <div className={`flex items-center justify-between pb-4 border-b ${divider}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div>
                <h3 className={`text-base font-bold ${boldText}`}>Assigned Subjects</h3>
                <p className={`text-xs ${subText}`}>{mySchedules.length} schedule{mySchedules.length !== 1 ? 's' : ''} assigned</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Loads',     value: mySchedules.length },
              { label: 'Unique Subjects', value: new Set(mySchedules.map(s => s.subject_id)).size },
              { label: 'Sections',        value: new Set(mySchedules.map(s => s.section_id)).size },
            ].map(({ label, value }) => (
              <div key={label} className={`p-4 rounded-2xl border text-center ${dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-2xl font-bold ${boldText}`}>{value}</p>
                <p className={`text-xs font-semibold mt-0.5 ${subText}`}>{label}</p>
              </div>
            ))}
          </div>

          {mySchedules.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-14 rounded-2xl border ${dark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <svg className={`w-8 h-8 ${dark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className={`text-base font-bold mb-1 ${boldText}`}>No Subjects Assigned</h4>
              <p className={`text-sm ${subText}`}>Assign schedules in the Scheduling tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySchedules.map(s => (
                <div key={s.id}
                  className={`relative rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md ${dark ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${DAY_COLORS[s.day_of_week]?.split(' ')[0]?.replace('bg-', 'bg-') || 'bg-slate-300'}`} />
                  <div className="pl-5 pr-5 py-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ${DAY_COLORS[s.day_of_week] || 'bg-slate-100 text-slate-700'}`}>
                        {s.day_of_week}
                      </span>
                      <span className={`text-xs font-mono font-semibold shrink-0 ${subText}`}>
                        {fmtTime(s.start_time)} – {fmtTime(s.end_time)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-bold mr-1.5 ${dark ? 'text-brand-400' : 'text-brand-600'}`}>{s.subject?.subject_code}</span>
                        <span className={`text-xs font-semibold ${boldText}`}>{s.subject?.descriptive_title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${dark ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-slate-200 bg-white text-slate-600'}`}>
                          {s.section?.section_name}
                        </span>
                        <span className={`text-[10px] ${subText}`}>{s.room}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyProfileTabs;
