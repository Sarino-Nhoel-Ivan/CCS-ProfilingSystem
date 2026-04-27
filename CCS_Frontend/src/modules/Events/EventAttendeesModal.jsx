import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  XMarkIcon,
  UsersIcon,
  CalendarDaysIcon,
  MapPinIcon,
  AcademicCapIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const getStatusColor = (status, dark) => {
  if (dark) {
    const c = { Upcoming: 'bg-blue-500/15 text-blue-400', Ongoing: 'bg-brand-500/15 text-brand-400', Completed: 'bg-green-500/15 text-green-400', Cancelled: 'bg-red-500/15 text-red-400' };
    return c[status] || 'bg-slate-700 text-slate-300';
  }
  const c = { Upcoming: 'bg-blue-100 text-blue-700', Ongoing: 'bg-brand-100 text-brand-700', Completed: 'bg-green-100 text-green-700', Cancelled: 'bg-red-100 text-red-700' };
  return c[status] || 'bg-slate-100 text-slate-700';
};

const getYearLevelColor = (yearLevel, dark) => {
  if (dark) {
    const c = { '1st Year': 'bg-sky-900/50 text-sky-300', '2nd Year': 'bg-violet-900/50 text-violet-300', '3rd Year': 'bg-amber-900/50 text-amber-300', '4th Year': 'bg-emerald-900/50 text-emerald-300' };
    return c[yearLevel] || 'bg-slate-700 text-slate-300';
  }
  const c = { '1st Year': 'bg-sky-100 text-sky-700', '2nd Year': 'bg-violet-100 text-violet-700', '3rd Year': 'bg-amber-100 text-amber-700', '4th Year': 'bg-emerald-100 text-emerald-700' };
  return c[yearLevel] || 'bg-slate-100 text-slate-700';
};

const EventAttendeesModal = ({ isOpen, onClose, event }) => {
  const dark = useDarkMode();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Theme tokens
  const modalBg  = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
  const headerBg = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const boldText = dark ? 'text-slate-100' : 'text-slate-800';
  const subText  = dark ? 'text-slate-400' : 'text-slate-500';
  const rowBg    = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100';
  const theadCls = dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500';
  const tbDivide = dark ? 'divide-slate-700/60' : 'divide-slate-100';
  const trHover  = dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50';
  const inputCls = dark
    ? 'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500'
    : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400';

  useEffect(() => {
    if (!isOpen || !event) return;
    setSearch('');
    setDetail(null);
    setError(null);
    setIsLoading(true);
    api.events.get(event.id)
      .then(d => setDetail(d))
      .catch(() => setError('Failed to load attendees.'))
      .finally(() => setIsLoading(false));
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const attendees = detail?.students || [];
  const filtered = attendees.filter(s =>
    !search ||
    `${s.first_name} ${s.last_name} ${s.year_level || ''} ${s.student_type || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  // Breakdown by year level
  const yearBreakdown = attendees.reduce((acc, s) => {
    const y = s.year_level || 'Unknown';
    acc[y] = (acc[y] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${modalBg}`}>

          {/* Header */}
          <div className={`p-6 border-b ${headerBg}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${boldText}`}>{event.eventName}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${getStatusColor(event.status, dark)}`}>
                      {event.status}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${subText}`}>
                      <CalendarDaysIcon className="w-3 h-3" />
                      {(() => {
                        const raw = event.eventDate;
                        if (!raw) return 'No date';
                        const d = new Date((raw.includes('+') || raw.endsWith('Z')) ? raw : raw.replace(' ', 'T'));
                        return isNaN(d.getTime()) ? raw : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      })()}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${subText}`}>
                      <MapPinIcon className="w-3 h-3" />{event.location}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[65vh] overflow-y-auto space-y-5">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">{error}</div>
            ) : (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-xl border text-center ${rowBg}`}>
                    <p className={`text-2xl font-bold ${boldText}`}>{attendees.length}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${subText}`}>Total</p>
                  </div>
                  {Object.entries(yearBreakdown).slice(0, 3).map(([yr, count]) => (
                    <div key={yr} className={`p-3 rounded-xl border text-center ${rowBg}`}>
                      <p className={`text-2xl font-bold ${boldText}`}>{count}</p>
                      <p className={`text-xs font-semibold mt-0.5 ${subText}`}>{yr}</p>
                    </div>
                  ))}
                </div>

                {/* Search */}
                {attendees.length > 0 && (
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search attendees..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${inputCls}`}
                  />
                )}

                {/* Attendee list */}
                {attendees.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-10 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                    <UsersIcon className={`w-10 h-10 mb-3 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
                    <p className={`font-semibold ${subText}`}>No attendees recorded</p>
                    <p className={`text-xs mt-1 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
                      Students can be linked to this event via the backend.
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-8 rounded-xl border ${dark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                    <p className={`text-sm ${subText}`}>No attendees match your search.</p>
                  </div>
                ) : (
                  <div className={`rounded-xl border overflow-hidden ${dark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <table className="w-full text-sm">
                      <thead className={`text-xs uppercase tracking-wider ${theadCls}`}>
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Student</th>
                          <th className="px-4 py-3 text-left font-bold hidden sm:table-cell">Year Level</th>
                          <th className="px-4 py-3 text-left font-bold">Type</th>
                          {detail?.students?.[0]?.pivot?.role && (
                            <th className="px-4 py-3 text-left font-bold">Role</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${tbDivide}`}>
                        {filtered.map(s => (
                          <tr key={s.id} className={`transition-colors ${trHover}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                                  {s.first_name?.[0]}{s.last_name?.[0]}
                                </div>
                                <p className={`font-semibold text-xs ${boldText}`}>
                                  {s.first_name} {s.last_name}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getYearLevelColor(s.year_level, dark)}`}>
                                {s.year_level || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium ${subText}`}>{s.student_type || 'N/A'}</span>
                            </td>
                            {s.pivot?.role && (
                              <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${dark ? 'bg-brand-900/40 text-brand-300' : 'bg-brand-50 text-brand-600'}`}>
                                  {s.pivot.role}
                                </span>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className={`px-6 py-3 flex justify-between items-center border-t ${dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`text-xs ${subText}`}>
              {attendees.length > 0 ? `${filtered.length} of ${attendees.length} attendees` : 'No attendees'}
            </p>
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

export default EventAttendeesModal;
