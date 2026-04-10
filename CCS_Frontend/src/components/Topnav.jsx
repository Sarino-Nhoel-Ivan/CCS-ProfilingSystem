import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useCurrentUser } from '../context/UserContext';
import {
  MagnifyingGlassIcon, SunIcon, MoonIcon, BellIcon,
} from '@heroicons/react/24/outline';

const Topnav = ({ currentModule, darkMode = false, onToggleDark }) => {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const closeSearch = () => { setShowDropdown(false); setSearchQuery(''); setSearchResults(null); };

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
        <button className={`relative p-2 transition-colors ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
          <span className={`absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 rounded-full ${darkMode ? 'border-slate-900' : 'border-white'}`}></span>
          <BellIcon className="w-6 h-6" />
        </button>



      </div>
    </header>
  );
};

export default Topnav;
