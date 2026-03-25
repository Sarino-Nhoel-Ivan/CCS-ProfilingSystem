import React, { useState } from 'react';
import {
  UserIcon, UsersIcon, BookOpenIcon, CalendarIcon,
  StarIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';

const Sidebar = ({ currentModule, setCurrentModule, user, onLogout }) => {
  const dark = useDarkMode();
  const [pinned, setPinned]   = useState(false);
  const [hovered, setHovered] = useState(false);
  const expanded = pinned || hovered;

  const modules = [
    { id: 'student',     label: 'Student Information',  Icon: UserIcon },
    { id: 'faculty',     label: 'Faculty Information',  Icon: UsersIcon },
    { id: 'instruction', label: 'Instruction',          Icon: BookOpenIcon },
    { id: 'scheduling',  label: 'Scheduling',           Icon: CalendarIcon },
    { id: 'events',      label: 'Events',               Icon: StarIcon },
    { id: 'search',      label: 'Comprehensive Search', Icon: MagnifyingGlassIcon },
  ];

  const initials = user
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (
    /* Fixed sidebar — doesn't affect layout flow, no reflow glitch */
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col h-full border-r transition-all duration-300 ease-in-out ${
        expanded ? 'w-64 shadow-2xl shadow-slate-900/50' : 'w-16'
      } ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* User profile header */}
      <div className={`flex items-center border-b h-20 overflow-hidden shrink-0 transition-all duration-300 ${
        expanded ? 'px-4' : 'px-0 justify-center'
      } ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shrink-0 overflow-hidden">
          <span className="text-sm">{initials}</span>
        </div>
        <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ml-3 ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
          <p className={`text-sm font-semibold leading-tight ${dark ? 'text-slate-100' : 'text-slate-800'}`}>
            {user?.name ?? 'Admin User'}
          </p>
          <p className={`text-[10px] mt-0.5 capitalize ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {user?.role ?? 'administrator'} · CCS
          </p>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-3 py-6 space-y-2 overflow-x-hidden">
        <p className={`px-2 text-xs font-semibold uppercase tracking-wider mb-4 transition-all duration-300 whitespace-nowrap ${
          expanded ? 'opacity-100' : 'opacity-0 h-0 hidden'
        } ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          Modules
        </p>

        {modules.map(module => {
          const isActive = currentModule === module.id;
          return (
            <button
              key={module.id}
              onClick={() => setCurrentModule(module.id)}
              title={!expanded ? module.label : ''}
              className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 group relative ${
                expanded ? 'px-4' : 'px-0 justify-center'
              } ${isActive
                ? 'bg-brand-600/10 text-brand-400 ring-1 ring-brand-500/50'
                : dark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(242,101,34,0.6)]" />
              )}
              <module.Icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                expanded ? 'mr-3' : 'mr-0'
              } ${isActive
                ? 'text-brand-400'
                : dark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700'
              }`} />
              <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 text-sm ${
                expanded ? 'opacity-100 w-auto inline-block' : 'opacity-0 w-0 hidden'
              }`}>
                {module.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom: logout only */}
      <div className={`p-3 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
        <button
          onClick={onLogout}
          title="Log Out"
          className={`w-full flex items-center rounded-xl transition-all duration-300 group text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 ${
            expanded ? 'px-4 py-3' : 'px-0 py-3 justify-center'
          }`}
        >
          <ArrowRightOnRectangleIcon className={`w-5 h-5 shrink-0 transition-all duration-300 group-hover:text-red-400 ${expanded ? 'mr-3' : 'mr-0'}`} />
          <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 text-sm ${
            expanded ? 'opacity-100 w-auto inline-block' : 'opacity-0 w-0 hidden'
          }`}>
            Log Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
