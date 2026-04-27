import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useCurrentUser } from '../context/UserContext';
import {
  MagnifyingGlassIcon, SunIcon, MoonIcon, BellIcon,
} from '@heroicons/react/24/outline';

// ── Notification helpers ──────────────────────────────────────────────────────
const NOTIF_ICONS = {
  student_created:      { emoji: '🎓', bg: 'bg-orange-100 dark:bg-orange-900/40' },
  student_updated:      { emoji: '✏️',  bg: 'bg-blue-100 dark:bg-blue-900/40' },
  student_deleted:      { emoji: '🗑️',  bg: 'bg-red-100 dark:bg-red-900/40' },
  faculty_created:      { emoji: '👨‍🏫', bg: 'bg-green-100 dark:bg-green-900/40' },
  faculty_updated:      { emoji: '✏️',  bg: 'bg-blue-100 dark:bg-blue-900/40' },
  faculty_deleted:      { emoji: '🗑️',  bg: 'bg-red-100 dark:bg-red-900/40' },
  violation_added:      { emoji: '⚠️',  bg: 'bg-yellow-100 dark:bg-yellow-900/40' },
  event_created:        { emoji: '📅',  bg: 'bg-violet-100 dark:bg-violet-900/40' },
  event_status_changed: { emoji: '🔄',  bg: 'bg-teal-100 dark:bg-teal-900/40' },
  event_deleted:        { emoji: '🗑️',  bg: 'bg-red-100 dark:bg-red-900/40' },
};
const getNotifIcon = (type) => NOTIF_ICONS[type] || { emoji: '🔔', bg: 'bg-slate-100' };

const getTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr.replace ? dateStr.replace(' ', 'T') : dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Topnav = ({ currentModule, darkMode = false, onToggleDark }) => {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const closeSearch = () => { setShowDropdown(false); setSearchQuery(''); setSearchResults(null); };

  // ── Notification helpers ──────────────────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch { /* silent */ }
  };

  const handleMarkRead = async (id) => {
    await api.notifications.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await api.notifications.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleDeleteNotif = async (id) => {
    await api.notifications.delete(id);
    const n = notifications.find(x => x.id === id);
    setNotifications(prev => prev.filter(x => x.id !== id));
    if (n && !n.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleClearAll = async () => {
    await api.notifications.clearAll();
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) handleMarkRead(notif.id);
    const d = notif.data || {};
    if (d.student_id) navigate(`/admin/users/${d.student_id}`);
    else if (d.faculty_id) navigate(`/admin/reports/${d.faculty_id}`);
    else if (d.event_id) navigate('/admin/events');
    setShowNotifications(false);
  };

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleResultClick = (type, id) => {
    closeSearch();
    if (type === 'student') navigate(`/admin/users/${id}`);
    else if (type === 'faculty') navigate(`/admin/reports/${id}`);
    else if (type === 'event') navigate('/admin/events');
    else if (type === 'subject') navigate('/admin/instruction');
  };

  const getModuleTitle = (moduleId) => {
    const titles = {
      'student': 'Student Information System',
      'faculty': 'Faculty Management',
      'instruction': 'Instruction & Curriculum',
      'scheduling': 'Course Scheduling',
      'events': 'Events & Curriculars',
      'search': 'Comprehensive Search'
    };
    return titles[moduleId] || 'Dashboard';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await api.search.query(searchQuery);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowDropdown(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <header className={`h-20 flex items-center justify-between px-8 shadow-sm z-40 sticky top-0 relative transition-colors duration-300 ${darkMode ? 'bg-slate-900 border-b border-slate-700/60' : 'bg-white border-b border-slate-200'}`}>
      <div className="flex items-center">
        <h2 className={`text-2xl font-bold tracking-tight transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          {getModuleTitle(currentModule)}
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative" ref={searchRef}>
          <input 
            type="text" 
            placeholder="Quick search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if(searchResults) setShowDropdown(true); }}
            className={`w-80 pl-10 pr-4 py-2.5 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium placeholder-slate-400 ${darkMode ? 'bg-slate-800 text-slate-200 placeholder-slate-500' : 'bg-slate-100 text-slate-700 placeholder-slate-400'}`}
          />
          <MagnifyingGlassIcon className={`w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 ${isSearching ? 'text-brand-500' : ''}`} />
          
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
          )}

          {/* Search Dropdown */}
          {showDropdown && searchResults && (
            <div className="absolute top-full mt-2 w-96 right-0 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-[70vh] flex flex-col z-50">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Results</span>
                <span className="text-xs text-slate-400">{Object.values(searchResults).flat().length} found</span>
              </div>
              <div className="overflow-y-auto p-2">
                
                {/* Students Section */}
                {searchResults.students?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="px-3 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 rounded-md mb-2">Students</h4>
                    <ul className="space-y-1">
                      {searchResults.students.map(s => (
                        <li key={s.id} onClick={() => handleResultClick('student', s.id)}
                          className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <p className="font-semibold text-sm text-slate-800">{s.first_name} {s.last_name}</p>
                          <p className="text-xs text-slate-500 truncate">{s.email}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Faculties Section */}
                {searchResults.faculties?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-md mb-2">Faculty</h4>
                    <ul className="space-y-1">
                      {searchResults.faculties.map(f => (
                        <li key={f.id} onClick={() => handleResultClick('faculty', f.id)}
                          className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <p className="font-semibold text-sm text-slate-800">{f.first_name} {f.last_name}</p>
                          <p className="text-xs text-slate-500 truncate">{f.position}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Subjects Section */}
                {searchResults.subjects?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded-md mb-2">Subjects</h4>
                    <ul className="space-y-1">
                      {searchResults.subjects.map(sub => (
                        <li key={sub.id} onClick={() => handleResultClick('subject', sub.id)}
                          className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <p className="font-semibold text-sm text-slate-800">{sub.subject_code}</p>
                          <p className="text-xs text-slate-500 truncate">{sub.descriptive_title}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Events Section */}
                {searchResults.events?.length > 0 && (
                  <div className="mb-2">
                    <h4 className="px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 rounded-md mb-2">Events</h4>
                    <ul className="space-y-1">
                      {searchResults.events.map(ev => (
                        <li key={ev.id} onClick={() => handleResultClick('event', ev.id)}
                          className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                          <p className="font-semibold text-sm text-slate-800">{ev.eventName}</p>
                          <p className="text-xs text-slate-500 truncate">{ev.eventType}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Object.values(searchResults).flat().length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-slate-500 text-sm">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onToggleDark}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-2 rounded-full transition-all duration-300 ${darkMode ? 'text-amber-400 hover:text-amber-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
        >
          {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(v => !v); if (!showNotifications) fetchNotifications(); }}
            className={`relative p-2 rounded-full transition-all duration-300 ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            {unreadCount > 0 && (
              <span className={`absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 ${darkMode ? 'border-slate-900' : 'border-white'}`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            <BellIcon className="w-6 h-6" />
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className={`absolute right-0 top-full mt-2 w-96 rounded-2xl shadow-2xl border overflow-hidden z-50 ${darkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
              {/* Header */}
              <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-2">
                  <BellIcon className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={`text-sm font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">{unreadCount} new</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${darkMode ? 'text-brand-400 hover:bg-brand-900/30' : 'text-brand-600 hover:bg-brand-50'}`}>
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={handleClearAll}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}>
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-12 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    <BellIcon className="w-10 h-10 mb-2" />
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No notifications yet</p>
                  </div>
                ) : (
                  <div className={`divide-y ${darkMode ? 'divide-slate-700/60' : 'divide-slate-100'}`}>
                    {notifications.map(n => {
                      const icon = getNotifIcon(n.type);
                      const timeAgo = getTimeAgo(n.created_at);
                      return (
                        <div key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group ${
                            !n.is_read
                              ? (darkMode ? 'bg-brand-900/10 hover:bg-brand-900/20' : 'bg-brand-50/60 hover:bg-brand-50')
                              : (darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50')
                          }`}>
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base ${icon.bg}`}>
                            {icon.emoji}
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-bold leading-tight ${!n.is_read ? (darkMode ? 'text-slate-100' : 'text-slate-800') : (darkMode ? 'text-slate-300' : 'text-slate-600')}`}>
                                {n.title}
                              </p>
                              {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-0.5" />}
                            </div>
                            <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {n.message}
                            </p>
                            <p className={`text-[10px] mt-1 font-medium ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{timeAgo}</p>
                          </div>
                          {/* Delete btn */}
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteNotif(n.id); }}
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all shrink-0 ${darkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>



      </div>
    </header>
  );
};

export default Topnav;
