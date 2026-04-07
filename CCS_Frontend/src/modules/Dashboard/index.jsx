import { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { STORAGE_URL } from '../../utils/config';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  UserGroupIcon, UsersIcon, AcademicCapIcon, CalendarDaysIcon,
  StarIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon,
  ArrowTrendingUpIcon, ChartBarIcon, BellAlertIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const StatCard = ({ icon: Icon, label, value, sub, accent, dark }) => {
  const accents = {
    orange: { border: 'border-l-orange-500', icon: dark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-500' },
    blue:   { border: 'border-l-brand-500',  icon: dark ? 'bg-brand-900/30 text-brand-400'  : 'bg-brand-50 text-brand-500'  },
    green:  { border: 'border-l-green-500',  icon: dark ? 'bg-green-900/30 text-green-400'  : 'bg-green-50 text-green-500'  },
    slate:  { border: 'border-l-slate-400',  icon: dark ? 'bg-slate-800 text-slate-400'     : 'bg-slate-100 text-slate-500' },
    red:    { border: 'border-l-red-500',    icon: dark ? 'bg-red-900/30 text-red-400'      : 'bg-red-50 text-red-500'      },
    violet: { border: 'border-l-violet-500', icon: dark ? 'bg-violet-900/30 text-violet-400': 'bg-violet-50 text-violet-500'},
  };
  const a = accents[accent] || accents.blue;
  return (
    <div className={`p-5 rounded-2xl border border-l-4 shadow-sm flex items-center gap-4 transition-colors duration-300 ${a.border} ${dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${a.icon}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const dark = useDarkMode();
  const [students, setStudents]   = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);

  const card    = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const divider  = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const rowHover = dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';

  useEffect(() => {
    Promise.all([
      api.students.getAll().catch(() => []),
      api.faculties.getAll().catch(() => []),
      api.events.getAll().catch(() => []),
    ]).then(([s, f, e]) => {
      setStudents(s);
      setFaculties(f);
      setEvents(e);
    }).finally(() => setLoading(false));
  }, []);

  const enrolled    = students.filter(s => s.enrollment_status === 'Enrolled').length;
  const notEnrolled = students.filter(s => s.enrollment_status !== 'Enrolled').length;
  const violations  = students.reduce((acc, s) => acc + (s.violations?.length || 0), 0);
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date()).slice(0, 5);
  const recentStudents = [...students].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  // Year level breakdown
  const yearBreakdown = ['1st Year','2nd Year','3rd Year','4th Year'].map(y => ({
    label: y,
    count: students.filter(s => s.year_level === y).length,
  }));
  const maxYear = Math.max(...yearBreakdown.map(y => y.count), 1);

  // Program breakdown
  const programs = [...new Set(students.map(s => s.program).filter(Boolean))];
  const programBreakdown = programs.map(p => ({
    label: p,
    count: students.filter(s => s.program === p).length,
  })).sort((a, b) => b.count - a.count);

  const Avatar = ({ student, size = 'sm' }) => {
    const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    const initials = `${student.first_name?.[0] ?? ''}${student.last_name?.[0] ?? ''}`;
    if (student.profile_photo) {
      return <img src={`${STORAGE_URL}/${student.profile_photo}`} alt={initials} className={`${sz} rounded-full object-cover shrink-0`} />;
    }
    return <div className={`${sz} rounded-full bg-brand-600/20 text-brand-400 flex items-center justify-center font-bold shrink-0`}>{initials}</div>;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl shadow-sm border transition-colors duration-300 ${card}`}>
        <h1 className={`text-3xl font-bold tracking-tight mb-1 ${boldText}`}>Admin Dashboard</h1>
        <p className={subText}>Overview of the CCS Profiling System.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={UserGroupIcon}          label="Total Students"    value={students.length}  sub={`${enrolled} enrolled`}       accent="orange" dark={dark} />
        <StatCard icon={CheckCircleIcon}         label="Enrolled"          value={enrolled}         sub="Active this semester"         accent="green"  dark={dark} />
        <StatCard icon={UsersIcon}               label="Faculty"           value={faculties.length} sub="Teaching staff"               accent="blue"   dark={dark} />
        <StatCard icon={ExclamationTriangleIcon} label="Violations"        value={violations}       sub="Across all students"          accent="red"    dark={dark} />
        <StatCard icon={StarIcon}                label="Events"            value={events.length}    sub={`${upcomingEvents.length} upcoming`} accent="violet" dark={dark} />
        <StatCard icon={AcademicCapIcon}         label="Not Enrolled"      value={notEnrolled}      sub="Inactive students"            accent="slate"  dark={dark} />
      </div>

      {/* Middle row: Year breakdown + Program breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Year Level Breakdown */}
        <div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
          <div className="flex items-center gap-2 mb-5">
            <ChartBarIcon className={`w-5 h-5 ${dark ? 'text-brand-400' : 'text-brand-500'}`} />
            <h2 className={`text-base font-bold ${boldText}`}>Students by Year Level</h2>
          </div>
          <div className="space-y-3">
            {yearBreakdown.map(({ label, count }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={subText}>{label}</span>
                  <span className={`font-semibold ${boldText}`}>{count}</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-700"
                    style={{ width: `${(count / maxYear) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Program Breakdown */}
        <div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
          <div className="flex items-center gap-2 mb-5">
            <AcademicCapIcon className={`w-5 h-5 ${dark ? 'text-brand-400' : 'text-brand-500'}`} />
            <h2 className={`text-base font-bold ${boldText}`}>Students by Program</h2>
          </div>
          {programBreakdown.length === 0
            ? <p className={`text-sm italic ${subText}`}>No program data.</p>
            : <div className="space-y-3">
                {programBreakdown.map(({ label, count }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`truncate max-w-[70%] ${subText}`}>{label}</span>
                      <span className={`font-semibold ${boldText}`}>{count}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                        style={{ width: `${(count / students.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Bottom row: Recent Students + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Students */}
        <div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
          <div className="flex items-center gap-2 mb-5">
            <ArrowTrendingUpIcon className={`w-5 h-5 ${dark ? 'text-brand-400' : 'text-brand-500'}`} />
            <h2 className={`text-base font-bold ${boldText}`}>Recently Added Students</h2>
          </div>
          <div className={`divide-y ${divider}`}>
            {recentStudents.length === 0
              ? <p className={`text-sm italic ${subText}`}>No students yet.</p>
              : recentStudents.map(s => (
                <div key={s.id} className={`flex items-center gap-3 py-3 rounded-lg transition-colors ${rowHover}`}>
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
        <div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${card}`}>
          <div className="flex items-center gap-2 mb-5">
            <BellAlertIcon className={`w-5 h-5 ${dark ? 'text-brand-400' : 'text-brand-500'}`} />
            <h2 className={`text-base font-bold ${boldText}`}>Upcoming Events</h2>
          </div>
          {upcomingEvents.length === 0
            ? <div className={`flex flex-col items-center justify-center py-8 rounded-xl ${dark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                <CalendarDaysIcon className={`w-8 h-8 mb-2 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className={`text-sm ${subText}`}>No upcoming events.</p>
              </div>
            : <div className="space-y-3">
                {upcomingEvents.map(e => (
                  <div key={e.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${dark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-center ${dark ? 'bg-brand-900/40 text-brand-300' : 'bg-brand-50 text-brand-600'}`}>
                      <span className="text-[10px] font-bold uppercase leading-none">
                        {new Date(e.event_date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-base font-bold leading-tight">
                        {new Date(e.event_date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${boldText}`}>{e.title || e.event_name}</p>
                      <p className={`text-xs truncate ${subText}`}>{e.location || e.venue || 'No location'}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${dark ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>
                      <ClockIcon className="w-3 h-3" />
                      {new Date(e.event_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
