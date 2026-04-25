import React, { useState } from 'react';
import {
  UserIcon, UsersIcon, BookOpenIcon, CalendarIcon,
  StarIcon,
  ArrowRightOnRectangleIcon, HomeIcon,
} from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';

const Sidebar = ({ currentModule, setCurrentModule, isOpen, setIsOpen, user, onLogout, onHoverChange }) => {
  const dark = useDarkMode();
  const [hovered, setHovered] = useState(false);
  const expanded = isOpen || hovered;

  const handleMouseEnter = () => { setHovered(true);  onHoverChange?.(true); };
  const handleMouseLeave = () => { setHovered(false); onHoverChange?.(false); };

  const modules = [
    { id: 'dashboard',   label: 'Dashboard',            Icon: HomeIcon },
    { id: 'student',     label: 'Student Information',  Icon: UserIcon },
    { id: 'faculty',     label: 'Faculty Information',  Icon: UsersIcon },
    { id: 'instruction', label: 'Instruction',          Icon: BookOpenIcon },
    { id: 'scheduling',  label: 'Scheduling',           Icon: CalendarIcon },
    { id: 'events',      label: 'Events',               Icon: StarIcon },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col h-full border-r transition-all duration-300 ease-in-out ${
        expanded ? 'w-64 shadow-2xl shadow-slate-900/50' : 'w-16'
      } ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo header */}
      <div className={`flex items-center border-b h-20 overflow-hidden shrink-0 transition-all duration-300 ${
        expanded ? 'px-4 justify-between' : 'px-0 justify-center'
      } ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center">
          <img
            src="/ccs_logo.jpg" alt="CCS"
            className={`h-10 object-contain drop-shadow-[0_0_10px_rgba(242,101,34,0.5)] transition-all duration-300 ${expanded ? 'w-10 mr-3' : 'w-10 mr-0'}`}
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100 w-auto inline-block' : 'opacity-0 w-0 hidden'}`}>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-amber-400 leading-tight">
              Profile Hub
            </h1>
          </div>
        </div>
        {expanded && (
          <button
            onClick={() => setIsOpen(p => !p)}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none shrink-0 ${
              isOpen
                ? dark ? 'bg-slate-800 text-brand-400' : 'bg-brand-50 text-brand-500'
                : dark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isOpen ? 'Unpin Sidebar' : 'Pin Sidebar'}
          >
            {isOpen
              ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z"/></svg>
              : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><line x1="12" y1="17" x2="12" y2="22"/><path d="M9 9v1.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17h12"/><path d="M15 9.34V6h1a2 2 0 000-4H7.89"/></svg>
            }
          </button>
        )}
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

      {/* Bottom: logout + user card */}
      <div className={`p-3 border-t space-y-2 ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
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

        {/* User card */}
        <div className={`flex items-center rounded-xl border transition-all duration-300 ${
          expanded ? 'p-3' : 'p-2 justify-center'
        } ${dark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0">
            {user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className={`whitespace-nowrap transition-all duration-300 ${expanded ? 'ml-3 opacity-100 w-auto block' : 'ml-0 opacity-0 w-0 hidden'}`}>
            <p className={`text-sm font-medium leading-none ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{user?.name ?? 'Admin User'}</p>
            <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.role ?? 'Administrator'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
