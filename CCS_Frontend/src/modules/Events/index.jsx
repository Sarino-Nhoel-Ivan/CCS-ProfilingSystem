import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import AddEventModal from './AddEventModal';
import EditEventModal from './EditEventModal';
import EventAttendeesModal from './EventAttendeesModal';
import { useDarkMode } from '../../context/DarkModeContext';
import {
  CalendarDaysIcon, MegaphoneIcon, PlusIcon, MapPinIcon,
  PencilSquareIcon, TrashIcon, ChevronRightIcon, UsersIcon,
  AcademicCapIcon, TrophyIcon, SparklesIcon, HeartIcon, StarIcon,
} from '@heroicons/react/24/outline';

const EventsModule = ({ events: propEvents = [], loading: propLoading = false, onReload }) => {
  const dark = useDarkMode();
  const card      = dark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100';
  const boldText  = dark ? 'text-slate-100' : 'text-slate-800';
  const subText   = dark ? 'text-slate-400' : 'text-slate-500';
  const tableBar  = dark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/50 border-slate-100';
  const evCard    = dark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200';
  const infoBox   = dark ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600';
  const footerBdr = dark ? 'border-slate-700' : 'border-slate-100';

  // Use prop-driven data (from App.jsx shared state) so the admin dashboard
  // stays in sync. Fall back to local fetch only if no onReload is provided.
  const [localEvents, setLocalEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(!onReload);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // If parent provides events via props, use those; otherwise use local state
  const events = onReload ? propEvents : localEvents;

  useEffect(() => {
    if (!onReload) fetchEventsLocal();
  }, []);

  const fetchEventsLocal = async () => {
    try {
      setIsLoading(true);
      const data = await api.events.getAll();
      setLocalEvents(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    if (onReload) onReload();
    else fetchEventsLocal();
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.events.delete(id);
        handleSuccess();
      } catch (err) {
        alert(err.message || 'Failed to delete event');
      }
    }
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const openAttendeesModal = (event) => {
    setSelectedEvent(event);
    setIsAttendeesModalOpen(true);
  };

  const getStatusColor = (status) => {
    if (dark) {
      const c = { 'Upcoming':'bg-blue-500/15 text-blue-400','Ongoing':'bg-brand-500/15 text-brand-400','Completed':'bg-green-500/15 text-green-400','Cancelled':'bg-red-500/15 text-red-400' };
      return c[status] || 'bg-slate-700 text-slate-300';
    }
    const c = { 'Upcoming':'bg-blue-100 text-blue-700','Ongoing':'bg-brand-100 text-brand-700','Completed':'bg-green-100 text-green-700','Cancelled':'bg-red-100 text-red-700' };
    return c[status] || 'bg-slate-100 text-slate-700';
  };

  const getStatusGlow = (status) => {
    const map = {
      Upcoming:  'hover:border-blue-400/60 hover:shadow-blue-400/30',
      Ongoing:   'hover:border-orange-400/60 hover:shadow-orange-400/30',
      Completed: 'hover:border-green-400/60 hover:shadow-green-400/30',
      Cancelled: 'hover:border-red-400/60 hover:shadow-red-400/30',
    };
    return map[status] || 'hover:border-slate-400/40 hover:shadow-slate-400/10';
  };

  const getTypeIcon = (type) => {
    const map = {
      Academic:         { Icon: AcademicCapIcon, bg: dark ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-500' },
      Sports:           { Icon: TrophyIcon,      bg: dark ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-50 text-orange-500' },
      Cultural:         { Icon: SparklesIcon,    bg: dark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-500' },
      CommunityService: { Icon: HeartIcon,       bg: dark ? 'bg-teal-900/40 text-teal-300'   : 'bg-teal-50 text-teal-500'     },
      Other:            { Icon: StarIcon,        bg: dark ? 'bg-slate-700 text-slate-300'     : 'bg-slate-100 text-slate-500'  },
    };
    return map[type] || map.Other;
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 shadow-sm border flex items-center transition-colors duration-300 ${card}`}>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 ${dark ? 'bg-brand-900/40 text-brand-400' : 'bg-brand-50 text-brand-600'}`}>
            <CalendarDaysIcon className="w-8 h-8" />
          </div>
          <div>
            <p className={`text-sm font-medium ${subText}`}>Total Events Hosted</p>
            <h3 className={`text-3xl font-bold ${boldText}`}>{events.length}</h3>
          </div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border flex items-center transition-colors duration-300 ${card}`}>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 ${dark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            <MegaphoneIcon className="w-8 h-8" />
          </div>
          <div>
            <p className={`text-sm font-medium ${subText}`}>Upcoming Activities</p>
            <h3 className={`text-3xl font-bold ${boldText}`}>{events.filter(e => e.status === 'Upcoming').length}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden flex flex-col h-[calc(100vh-280px)] transition-colors duration-300 ${card}`}>
        <div className={`p-6 border-b flex justify-between items-center transition-colors duration-300 ${tableBar}`}>
          <div>
            <h2 className={`text-xl font-bold ${boldText}`}>Events Dashboard</h2>
            <p className={`text-sm mt-1 ${subText}`}>Track departmental activities and student participation.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors shadow-sm shadow-brand-500/30 flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Event
          </button>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className={`flex-1 overflow-y-auto p-6 ${dark ? 'bg-slate-950/30' : 'bg-slate-50/30'}`}>
          {(onReload ? propLoading : isLoading) ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => {
                const { Icon: TypeIcon, bg: typeBg } = getTypeIcon(event.eventType);
                const statusGlow = getStatusGlow(event.status);
                return (
                  <div key={event.id}
                    className={`relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${statusGlow} ${dark ? `bg-slate-800 border-slate-700` : `bg-white border-slate-200`}`}>

                    {/* Top accent bar */}
                    <div className={`h-1 w-full ${
                      event.status === 'Upcoming'  ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                      event.status === 'Ongoing'   ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                      event.status === 'Completed' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                                     'bg-gradient-to-r from-red-400 to-red-500'}`} />

                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${typeBg}`}>
                            <TypeIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className={`font-bold text-base leading-tight truncate ${boldText}`}>{event.eventName}</h3>
                            <p className={`text-[11px] font-semibold uppercase tracking-wider mt-0.5 ${subText}`}>{event.eventType}</p>
                          </div>
                        </div>
                        <span className={`ml-2 shrink-0 px-2.5 py-1 text-[10px] font-bold rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>

                      {/* Description */}
                      <p className={`text-sm mb-4 line-clamp-2 min-h-[40px] ${subText}`}>
                        {event.description || 'No description provided.'}
                      </p>

                      {/* Info rows */}
                      <div className={`space-y-2 p-3 rounded-xl border ${infoBox}`}>
                        <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <CalendarDaysIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="font-medium truncate">
                            {(() => {
                              const raw = event.eventDate;
                              if (!raw) return 'No date';
                              const d = new Date(
                                (raw.includes('+') || raw.endsWith('Z')) ? raw : raw.replace(' ', 'T')
                              );
                              return isNaN(d.getTime()) ? raw : d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            })()}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="font-medium truncate">{event.location || 'No location set'}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className={`mt-4 pt-3 border-t flex justify-between items-center ${footerBdr}`}>
                        <button className={`flex items-center gap-1 text-xs font-semibold transition-colors ${dark ? 'text-brand-400 hover:text-brand-300' : 'text-brand-500 hover:text-brand-600'}`}
                          onClick={() => openAttendeesModal(event)}>
                          <UsersIcon className="w-3.5 h-3.5" />
                          View Attendees
                          <ChevronRightIcon className="w-3 h-3" />
                        </button>
                        <div className="flex gap-1">
                          <button onClick={() => openEditModal(event)}
                            className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-brand-400 hover:bg-brand-500/10' : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'}`}>
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteEvent(event.id)}
                            className={`p-1.5 rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
              <CalendarDaysIcon className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium">No events logged</p>
              <p className="text-sm">Click "Add Event" to schedule an activity.</p>
            </div>
          )}
        </div>
      </div>

      <AddEventModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleSuccess} 
      />

      {isEditModalOpen && selectedEvent && (
        <EditEventModal
          isOpen={isEditModalOpen}
          initialData={selectedEvent}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {isAttendeesModalOpen && selectedEvent && (
        <EventAttendeesModal
          isOpen={isAttendeesModalOpen}
          event={selectedEvent}
          onClose={() => {
            setIsAttendeesModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default EventsModule;
