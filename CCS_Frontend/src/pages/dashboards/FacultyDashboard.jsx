import { useState, createContext, useContext } from 'react';

/* ─── theme context (mirrors StudentDashboard) ── */
const ThemeCtx = createContext(true); // true = dark
const useTheme = () => useContext(ThemeCtx);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'profile',   label: 'My Profile',  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'subjects',  label: 'My Subjects', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'schedule',  label: 'My Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'students',  label: 'My Students', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
];

const ANNOUNCEMENTS = [
  { id: 1, title: 'Mid-term Grades Submission Deadline', date: 'Mar 22, 2026', tag: 'Deadline', color: 'from-red-500 to-pink-500',      desc: 'Please submit all mid-term grades through the faculty portal before March 22, 2026.' },
  { id: 2, title: 'Faculty Meeting — March 16, 2026',    date: 'Mar 16, 2026', tag: 'Meeting',  color: 'from-blue-500 to-purple-500',   desc: 'Mandatory faculty meeting at 2:00 PM in the CCS Conference Room. Attendance is required.' },
  { id: 3, title: 'New Section Added to Your Schedule',  date: 'Mar 10, 2026', tag: 'Update',   color: 'from-emerald-500 to-teal-500', desc: 'Section BSIT-3A has been added to your schedule for IT 311 starting March 17.' },
  { id: 4, title: 'IT Week 2026 — Faculty Coordinators', date: 'Mar 8, 2026',  tag: 'Event',    color: 'from-brand-500 to-amber-500',  desc: 'Faculty coordinators for IT Week 2026 are requested to submit their event proposals by March 15.' },
];

/* ─── NavLink uses ThemeCtx ── */
const NavLink = ({ item, active, sidebarExpanded, onSelect }) => {
  const dark = useTheme();
  const isActive = active === item.id;
  return (
    <button
      onClick={() => onSelect(item.id)}
      title={!sidebarExpanded ? item.label : ''}
      className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 group relative
        ${sidebarExpanded ? 'px-4' : 'px-0 justify-center'}
        ${isActive
          ? 'bg-brand-600/10 text-brand-400 ring-1 ring-brand-500/50'
          : dark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(242,101,34,0.6)]" />
      )}
      <svg
        className={`w-5 h-5 shrink-0 transition-all duration-300 ${sidebarExpanded ? 'mr-3' : 'mr-0'}
          ${isActive ? 'text-brand-400' : dark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700'}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.icon} />
      </svg>
      <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 text-sm ${sidebarExpanded ? 'opacity-100 w-auto inline-block' : 'opacity-0 w-0 hidden'}`}>
        {item.label}
      </span>
    </button>
  );
};

/* ─── DashboardPanel uses ThemeCtx ── */
const DashboardPanel = ({ user, initials }) => {
  const dark = useTheme();

  const stats = [
    { label: 'Subjects Handled', val: '4',   icon: '📚', darkColor: 'from-blue-500/20 to-purple-500/10 border-blue-500/20',     lightColor: 'bg-blue-50 border-blue-100'     },
    { label: 'Total Students',   val: '120', icon: '👥', darkColor: 'from-brand-500/20 to-amber-500/10 border-brand-500/20',    lightColor: 'bg-orange-50 border-orange-100' },
    { label: 'Sections',         val: '6',   icon: '🗂️', darkColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20', lightColor: 'bg-emerald-50 border-emerald-100' },
    { label: 'Upcoming Events',  val: '2',   icon: '📅', darkColor: 'from-rose-500/20 to-pink-500/10 border-rose-500/20',       lightColor: 'bg-rose-50 border-rose-100'     },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 ${dark ? 'bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100'}`}>
        <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">{initials}</div>
          <div>
            <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Welcome back,</p>
            <h2 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{user?.name} 👋</h2>
            <p className={`text-sm mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>CCS Faculty Member · Profile Hub</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${dark ? `bg-gradient-to-br ${s.darkColor}` : s.lightColor}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{s.val}</div>
            <div className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Announcements */}
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>📢 Announcements</h3>
        <div className="space-y-3">
          {ANNOUNCEMENTS.map(a => (
            <div key={a.id} className={`flex gap-4 p-4 rounded-2xl border transition-all ${dark ? 'bg-slate-800/50 border-slate-700/40 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 bg-gradient-to-b ${a.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{a.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${a.color} text-white`}>{a.tag}</span>
                    <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{a.date}</span>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── PlaceholderPanel uses ThemeCtx ── */
const PlaceholderPanel = ({ id }) => {
  const dark = useTheme();
  const item = NAV_ITEMS.find(n => n.id === id);
  return (
    <div className={`rounded-2xl border p-8 min-h-[60vh] flex flex-col items-center justify-center text-center ${dark ? 'bg-slate-900/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item?.icon} />
        </svg>
      </div>
      <h3 className={`text-xl font-bold mb-2 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>Development in Progress</h3>
      <p className={dark ? 'text-slate-500' : 'text-slate-400'}>The {item?.label} module is currently being built.</p>
    </div>
  );
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
const FacultyDashboard = ({ user, onLogout }) => {
  const [active,         setActive]         = useState('dashboard');
  const [sidebarPinned,  setSidebarPinned]  = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('fd_theme') !== 'light');

  const toggleTheme = () => setDark(d => {
    const next = !d;
    localStorage.setItem('fd_theme', next ? 'dark' : 'light');
    return next;
  });

  const sidebarExpanded = sidebarPinned || sidebarHovered;
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'FC';

  const panels = {
    dashboard: <DashboardPanel user={user} initials={initials} />,
    profile:   <PlaceholderPanel id="profile" />,
    subjects:  <PlaceholderPanel id="subjects" />,
    schedule:  <PlaceholderPanel id="schedule" />,
    students:  <PlaceholderPanel id="students" />,
  };

  const activeNav = NAV_ITEMS.find(n => n.id === active);

  return (
    <ThemeCtx.Provider value={dark}>
      <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-300 ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
        {dark && <>
          <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
        </>}

        {/* ── Sidebar ── */}
        <aside
          className={`relative z-50 flex flex-col h-full border-r transition-all duration-300 ease-in-out shrink-0
            ${sidebarExpanded ? 'w-64 shadow-2xl shadow-slate-900/50' : 'w-16'}
            ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          {/* User header */}
          <div className={`flex items-center border-b h-20 overflow-hidden shrink-0 transition-all duration-300
            ${sidebarExpanded ? 'px-4' : 'px-0 justify-center'}
            ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <span className="text-sm">{initials}</span>
            </div>
            <div className={`flex flex-col whitespace-nowrap transition-all duration-300 ml-3 ${sidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
              <p className={`text-sm font-semibold leading-tight ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{user?.name ?? 'Faculty'}</p>
              <p className={`text-[10px] mt-0.5 capitalize ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.role} · CCS</p>
            </div>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto px-3 py-6 space-y-2 overflow-x-hidden">
            <p className={`px-2 text-xs font-semibold uppercase tracking-wider mb-4 whitespace-nowrap transition-all duration-300
              ${sidebarExpanded ? 'opacity-100' : 'opacity-0 h-0 hidden'}
              ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Navigation
            </p>
            {NAV_ITEMS.map(item => (
              <NavLink key={item.id} item={item} active={active} sidebarExpanded={sidebarExpanded} onSelect={setActive} />
            ))}
          </div>

          {/* Logout */}
          <div className={`p-3 border-t ${dark ? 'border-slate-800' : 'border-slate-100'}`}>
            <button onClick={onLogout} title="Log Out"
              className={`w-full flex items-center rounded-xl transition-all duration-300 group border border-transparent hover:border-red-500/20
                ${sidebarExpanded ? 'px-4 py-3' : 'px-0 py-3 justify-center'}
                ${dark ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-500'}`}>
              <svg className={`w-5 h-5 shrink-0 transition-all duration-300 group-hover:text-red-400 ${sidebarExpanded ? 'mr-3' : 'mr-0'}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 text-sm ${sidebarExpanded ? 'opacity-100 w-auto inline-block' : 'opacity-0 w-0 hidden'}`}>
                Log Out
              </span>
            </button>
          </div>
        </aside>

        {/* ── Right column ── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">

          {/* Topnav */}
          <header className={`relative z-30 flex items-center justify-between px-5 py-4 border-b backdrop-blur-xl shrink-0
            ${dark ? 'border-slate-800/60 bg-slate-900/80' : 'border-slate-200 bg-white/90 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(242,101,34,0.4)]">
                <img src="/ccs_logo.jpg" alt="CCS" className="w-6 h-6 object-contain rounded-lg" onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <div>
                <h1 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-amber-400 leading-none">Profile Hub</h1>
                <p className={`text-[10px] leading-none mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Faculty Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme toggle — same style as StudentDashboard */}
              <button
                onClick={toggleTheme}
                title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className={`p-2 rounded-xl border transition-all
                  ${dark ? 'bg-slate-800/60 border-slate-700/50 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
              >
                {dark
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                }
              </button>
            </div>
          </header>

          {/* Main content */}
          <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-colors duration-300 ${dark ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <div className={`sticky top-0 z-10 px-6 py-4 backdrop-blur-xl border-b flex items-center gap-3
              ${dark ? 'bg-slate-900/80 border-slate-800/50' : 'bg-white/90 border-slate-200'}`}>
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={activeNav?.icon} />
              </svg>
              <h2 className={`text-base font-bold ${dark ? 'text-slate-100' : 'text-slate-800'}`}>{activeNav?.label}</h2>
            </div>
            <div className="p-6">{panels[active]}</div>
          </main>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
};

export default FacultyDashboard;
