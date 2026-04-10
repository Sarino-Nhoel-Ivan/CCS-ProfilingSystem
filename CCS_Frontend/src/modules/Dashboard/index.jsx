import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { STORAGE_URL } from '../../utils/config';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  UserGroupIcon, UsersIcon, AcademicCapIcon, CalendarDaysIcon,
  StarIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon,
  ArrowTrendingUpIcon, ChartBarIcon, BellAlertIcon, MapPinIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const StatCard = ({ icon: Icon, label, value, sub, gradient, iconBg, glowColor, dark }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm border transition-all duration-300 cursor-default
    hover:-translate-y-2 hover:shadow-xl ${glowColor}
    ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
    {/* Subtle background gradient blob */}
    <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 ${gradient}`} />
    <div className="relative flex items-start justify-between">
      <div>
        <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
        <p className={`text-3xl font-extrabold tracking-tight ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
        {sub && <p className={`text-xs mt-1.5 font-medium ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const dark = useDarkMode();
  const [students, setStudents]   = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const card     = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const rowHover = dark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50';

  useEffect(() => {
    Promise.all([
      api.students.getAll().catch(() => []),
      api.faculties.getAll().catch(() => []),
      api.events.getAll().catch(() => []),
    ]).then(([s, f, e]) => { setStudents(s); setFaculties(f); setEvents(e); })
      .finally(() => setLoading(false));
  }, []);

  const enrolled       = students.filter(s => s.enrollment_status === 'Enrolled').length;
  const notEnrolled    = students.filter(s => s.enrollment_status !== 'Enrolled').length;
  const violations     = students.reduce((acc, s) => acc + (s.violations?.length || 0), 0);
  const upcomingEvents = events.filter(e => e.status === 'Upcoming').slice(0, 5);
  const recentStudents = [...students].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  const yearBreakdown = ['1st Year','2nd Year','3rd Year','4th Year'].map(y => ({
    label: y, count: students.filter(s => s.year_level === y).length,
  }));
  const maxYear = Math.max(...yearBreakdown.map(y => y.count), 1);
  const totalStudents = students.length || 1;

  const RingChart = ({ pct, color = '#f97316', trackColor }) => {
    const r = 15.9;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
      <div className="relative w-12 h-12 shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={r} fill="none" stroke={trackColor} strokeWidth="3.5" />
          <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="3.5"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.7s ease' }} />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-extrabold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
          {pct}%
        </span>
      </div>
    );
  };

  const programs = [...new Set(students.map(s => s.program).filter(Boolean))];
  const programBreakdown = programs.map(p => ({
    label: p, count: students.filter(s => s.program === p).length,
  })).sort((a, b) => b.count - a.count);

  const Avatar = ({ student }) => {
    const [imgError, setImgError] = useState(false);
    const initials = `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`;
    const photoSrc = student.profile_photo
      ? (student.profile_photo.startsWith('http') ? student.profile_photo : `${STORAGE_URL}/${student.profile_photo}`)
      : null;
    if (photoSrc && !imgError)
      return <img src={photoSrc} alt={initials} className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white" onError={() => setImgError(true)} />;
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-white">
        {initials}
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
    </div>
  );

  const enrollPct = students.length ? Math.round((enrolled / students.length) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* ── Hero Header ── */}
      <div className={`relative overflow-hidden rounded-2xl p-7 shadow-sm border transition-colors duration-300 ${card}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-brand-500/5 pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${dark ? 'text-orange-400' : 'text-orange-500'}`}>CCS Profiling System</p>
            <h1 className={`text-3xl font-extrabold tracking-tight ${boldText}`}>Admin Dashboard</h1>
            <p className={`mt-1 text-sm ${subText}`}>Overview of students, faculty, and system activity.</p>
          </div>
          {/* Enrollment ring */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={dark ? '#1e293b' : '#f1f5f9'} strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f97316" strokeWidth="3"
                  strokeDasharray={`${enrollPct} ${100 - enrollPct}`} strokeLinecap="round" />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${boldText}`}>{enrollPct}%</span>
            </div>
            <div>
              <p className={`text-xs font-semibold ${subText}`}>Enrollment Rate</p>
              <p className={`text-lg font-bold ${boldText}`}>{enrolled} / {students.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={UserGroupIcon}          label="Total Students" value={students.length} sub={`${enrolled} enrolled · ${notEnrolled} inactive`}
          gradient="bg-orange-500" iconBg={dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500'}
          glowColor="hover:border-orange-400/60 hover:shadow-orange-400/30" dark={dark} />
        <StatCard icon={CheckCircleIcon}         label="Enrolled"       value={enrolled}        sub="Active this semester"
          gradient="bg-green-500"  iconBg={dark ? 'bg-green-900/40 text-green-400'  : 'bg-green-50 text-green-500'}
          glowColor="hover:border-green-400/60 hover:shadow-green-400/30" dark={dark} />
        <StatCard icon={UsersIcon}               label="Faculty"        value={faculties.length} sub="Teaching staff"
          gradient="bg-blue-500"   iconBg={dark ? 'bg-blue-900/40 text-blue-400'    : 'bg-blue-50 text-blue-500'}
          glowColor="hover:border-blue-400/60 hover:shadow-blue-400/30" dark={dark} />
        <StatCard icon={ExclamationTriangleIcon} label="Violations"     value={violations}      sub="Across all students"
          gradient="bg-red-500"    iconBg={dark ? 'bg-red-900/40 text-red-400'      : 'bg-red-50 text-red-500'}
          glowColor="hover:border-red-400/60 hover:shadow-red-400/30" dark={dark} />
        <StatCard icon={StarIcon}                label="Events"         value={events.length}   sub={`${upcomingEvents.length} upcoming · ${events.filter(e=>e.status==='Ongoing').length} ongoing`}
          gradient="bg-violet-500" iconBg={dark ? 'bg-violet-900/40 text-violet-400': 'bg-violet-50 text-violet-500'}
          glowColor="hover:border-violet-400/60 hover:shadow-violet-400/30" dark={dark} />
        <StatCard icon={NoSymbolIcon}            label="Not Enrolled"   value={notEnrolled}     sub="Inactive students"
          gradient="bg-slate-500"  iconBg={dark ? 'bg-slate-800 text-slate-400'     : 'bg-slate-100 text-slate-500'}
          glowColor="hover:border-slate-400/60 hover:shadow-slate-400/20" dark={dark} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Year Level */}
        <div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
              <ChartBarIcon className="w-4 h-4" />
            </div>
            <h2 className={`text-sm font-bold ${boldText}`}>Students by Year Level</h2>
          </div>
          <div className="space-y-4">
            {yearBreakdown.map(({ label, count }) => {
              const pct = Math.round((count / totalStudents) * 100);
              return (
              <div key={label} className="flex items-center gap-3">
                <span className={`text-xs font-semibold w-14 shrink-0 ${subText}`}>{label}</span>
                <div className={`flex-1 h-2.5 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-700"
                    style={{ width: `${(count / maxYear) * 100}%` }} />
                </div>
                <span className={`text-xs font-bold w-5 text-right ${boldText}`}>{count}</span>
                <RingChart pct={pct} color="#f97316" trackColor={dark ? '#1e293b' : '#f1f5f9'} />
              </div>
              );
            })}
          </div>
        </div>

        {/* Program */}
        <div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-500'}`}>
              <AcademicCapIcon className="w-4 h-4" />
            </div>
            <h2 className={`text-sm font-bold ${boldText}`}>Students by Program</h2>
          </div>
          {programBreakdown.length === 0
            ? <p className={`text-sm italic ${subText}`}>No program data.</p>
            : <div className="space-y-4">
                {programBreakdown.map(({ label, count }) => {
                  const pct = Math.round((count / totalStudents) * 100);
                  return (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`text-xs font-semibold flex-1 truncate ${subText}`}>{label}</span>
                    <div className={`w-32 h-2.5 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                        style={{ width: `${(count / totalStudents) * 100}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-5 text-right ${boldText}`}>{count}</span>
                    <RingChart pct={pct} color="#3b82f6" trackColor={dark ? '#1e293b' : '#f1f5f9'} />
                  </div>
                  );
                })}
              </div>
          }
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Students */}
        <div className={`rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
          <div className={`flex items-center gap-2 px-6 py-4 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
              <ArrowTrendingUpIcon className="w-4 h-4" />
            </div>
            <h2 className={`text-sm font-bold ${boldText}`}>Recently Added Students</h2>
            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{recentStudents.length}</span>
          </div>
          <div className={`divide-y ${divider}`}>
            {recentStudents.length === 0
              ? <p className={`p-6 text-sm italic ${subText}`}>No students yet.</p>
              : recentStudents.map(s => (
                <div key={s.id} className={`flex items-center gap-3 px-6 py-3.5 transition-colors ${rowHover}`}>
                  <Avatar student={s} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${boldText}`}>{s.first_name} {s.last_name}</p>
                    <p className={`text-xs truncate ${subText}`}>{s.program || 'N/A'} · {s.year_level || 'N/A'}</p>
                  </div>
                  {s.enrollment_status === 'Enrolled'
                    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 shrink-0">
                        <CheckCircleSolid className="w-3 h-3" />Enrolled
                      </span>
                    : <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{s.enrollment_status}</span>
                  }
                </div>
              ))
            }
          </div>
        </div>

        {/* Upcoming Events */}
        <div className={`rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
          <div className={`flex items-center gap-2 px-6 py-4 border-b ${dark ? 'border-slate-700/60' : 'border-slate-100'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-violet-900/40 text-violet-400' : 'bg-violet-50 text-violet-500'}`}>
              <BellAlertIcon className="w-4 h-4" />
            </div>
            <h2 className={`text-sm font-bold ${boldText}`}>Upcoming Events</h2>
            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{upcomingEvents.length}</span>
          </div>
          {upcomingEvents.length === 0
            ? <div className={`flex flex-col items-center justify-center py-12 ${dark ? 'text-slate-600' : 'text-slate-300'}`}>
                <CalendarDaysIcon className="w-10 h-10 mb-2" />
                <p className={`text-sm ${subText}`}>No upcoming events.</p>
              </div>
            : <div className={`divide-y ${divider}`}>
                {upcomingEvents.map(e => {
                  const d = new Date(e.eventDate);
                  return (
                    <div key={e.id} className={`flex items-start gap-4 px-6 py-4 transition-colors ${rowHover}`}>
                      {/* Date chip */}
                      <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 text-center border ${dark ? 'bg-slate-800 border-slate-700 text-orange-400' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                        <span className="text-[9px] font-bold uppercase leading-none">
                          {d.toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-base font-extrabold leading-tight">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${boldText}`}>{e.eventName}</p>
                        <div className={`flex items-center gap-1 mt-0.5 text-xs ${subText}`}>
                          <MapPinIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{e.location || 'No location'}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${dark ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>
                        <ClockIcon className="w-3 h-3" />
                        {d.toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
