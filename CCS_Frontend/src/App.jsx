import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topnav from './components/Topnav';
import StudentModule from './modules/Student';
import FacultyModule from './modules/Faculty';
import InstructionModule from './modules/Instruction';
import SchedulingModule from './modules/Scheduling';
import EventsModule from './modules/Events';
import AdminDashboard from './modules/Dashboard';
import StudentLogin from './pages/StudentLogin';
import FacultyLogin from './pages/FacultyLogin';
import AdminLogin from './pages/AdminLogin';
import StudentSignUp from './pages/StudentSignUp';
import FacultySignUp from './pages/FacultySignUp';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import FacultyDashboard from './pages/dashboards/FacultyDashboard';
import { DarkModeContext } from './context/DarkModeContext';
import { UserContext } from './context/UserContext';
import { api, cache } from './utils/api';

const getStoredUser = () => {
  try {
    const s = localStorage.getItem('auth_user');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
};

// Map URL path → module id for sidebar highlight
const PATH_TO_MODULE = {
  '/admin/dashboard': 'dashboard',
  '/admin/users':     'student',
  '/admin/reports':   'faculty',
  '/admin/instruction': 'instruction',
  '/admin/scheduling':  'scheduling',
  '/admin/events':      'events',
};

// Derive module from pathname, handling sub-paths like /admin/users/42
const getModuleFromPath = (pathname) => {
  if (pathname.startsWith('/admin/users'))     return 'student';
  if (pathname.startsWith('/admin/reports'))   return 'faculty';
  if (pathname.startsWith('/admin/instruction')) return 'instruction';
  if (pathname.startsWith('/admin/scheduling'))  return 'scheduling';
  if (pathname.startsWith('/admin/events'))      return 'events';
  if (pathname.startsWith('/admin/dashboard'))   return 'dashboard';
  return 'dashboard';
};

/* ── Admin layout ── */
function AdminLayout({ user, onLogout }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('adminDarkMode') === 'true'
  );

  // ── Shared data fetched ONCE here, passed down as props ──────────────────
  const [students,  setStudents]  = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [events,    setEvents]    = useState([]);
  const [skills,    setSkills]    = useState([]);
  const [courses,   setCourses]   = useState([]);
  const [dataLoading, setDataLoading] = useState({ students: true, faculties: true, events: true });

  useEffect(() => {
    api.students.getAll().then(setStudents).catch(() => {}).finally(() => setDataLoading(p => ({ ...p, students: false })));
    api.faculties.getAll().then(setFaculties).catch(() => {}).finally(() => setDataLoading(p => ({ ...p, faculties: false })));
    api.events.getAll().then(setEvents).catch(() => {}).finally(() => setDataLoading(p => ({ ...p, events: false })));
    api.skills.getAll().then(setSkills).catch(() => {});
    api.courses.getAll().then(setCourses).catch(() => {});
  }, []);

  const reloadStudents  = async () => { cache.bust('students');  const d = await api.students.getAll().catch(() => []); setStudents(d); };
  const reloadFaculties = async () => { cache.bust('faculties'); const d = await api.faculties.getAll().catch(() => []); setFaculties(d); };
  const reloadEvents    = async () => {
    setDataLoading(p => ({ ...p, events: true }));
    cache.bust('events');
    const d = await api.events.getAll().catch(() => []);
    setEvents(d);
    setDataLoading(p => ({ ...p, events: false }));
  };

  // Derive currentModule from URL so sidebar stays in sync
  const currentModule = getModuleFromPath(location.pathname);

  const setCurrentModule = (id) => {
    const pathMap = {
      dashboard:   '/admin/dashboard',
      student:     '/admin/users',
      faculty:     '/admin/reports',
      instruction: '/admin/instruction',
      scheduling:  '/admin/scheduling',
      events:      '/admin/events',
    };
    navigate(pathMap[id] ?? '/admin/dashboard');
  };

  const handleToggleDark = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('adminDarkMode', next);
      return next;
    });
  };

  return (
    <UserContext.Provider value={user}>
      <DarkModeContext.Provider value={darkMode}>
      <div className={`flex h-screen w-screen overflow-hidden font-sans relative transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <Sidebar
          currentModule={currentModule}
          setCurrentModule={setCurrentModule}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onHoverChange={setIsSidebarHovered}
          user={user}
          onLogout={onLogout}
        />
        <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 ease-in-out ${isSidebarOpen || isSidebarHovered ? 'ml-64' : 'ml-16'}`}>
          <Topnav currentModule={currentModule} darkMode={darkMode} onToggleDark={handleToggleDark} userName={user?.name || user?.email || 'Admin'} />
          <main className={`flex-1 overflow-x-hidden overflow-y-auto p-8 transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className="max-w-7xl mx-auto space-y-6 h-full">
              <Routes>
                <Route path="dashboard"   element={<AdminDashboard students={students} faculties={faculties} events={events} loading={dataLoading} />} />
                <Route path="users"       element={<StudentModule students={students} skills={skills} courses={courses} loading={dataLoading.students} onReload={reloadStudents} />} />
                <Route path="users/:id"   element={<StudentModule students={students} skills={skills} courses={courses} loading={dataLoading.students} onReload={reloadStudents} />} />
                <Route path="reports"     element={<FacultyModule faculties={faculties} loading={dataLoading.faculties} onReload={reloadFaculties} />} />
                <Route path="reports/:id" element={<FacultyModule faculties={faculties} loading={dataLoading.faculties} onReload={reloadFaculties} />} />
                <Route path="instruction" element={<InstructionModule students={students} />} />
                <Route path="scheduling"  element={<SchedulingModule students={students} faculties={faculties} />} />
                <Route path="events"      element={<EventsModule events={events} loading={dataLoading.events} onReload={reloadEvents} />} />
                <Route path="*"           element={<Navigate to="dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </DarkModeContext.Provider>
    </UserContext.Provider>
  );
}

/* ── Root App ── */
function App() {
  const [user, setUser] = useState(getStoredUser);
  const navigate = useNavigate();

  const dashboardPath = (u) => {
    if (!u) return '/student/login';
    if (u.role === 'admin') return '/admin/dashboard';
    if (u.role === 'faculty') return '/faculty';
    return '/student';
  };

  const handleLogin = (userData) => {
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
    navigate(dashboardPath(userData), { replace: true });
  };

  const handleSignUp = (userData) => {
    localStorage.setItem('auth_user', JSON.stringify(userData));
    setUser(userData);
    navigate(dashboardPath(userData), { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    const role = user?.role;
    setUser(null);
    if (role === 'admin') navigate('/admin/login', { replace: true });
    else if (role === 'faculty') navigate('/faculty/login', { replace: true });
    else navigate('/student/login', { replace: true });
  };

  return (
    <Routes>
      {/* Student routes */}
      <Route path="/login" element={<Navigate to="/student/login" replace />} />
      <Route
        path="/student/login"
        element={user?.role === 'student'
          ? <Navigate to={dashboardPath(user)} replace />
          : <StudentLogin onLogin={handleLogin} />}
      />
      {/* student/signup removed — accounts created by admin only */}
      <Route path="/student/signup" element={<Navigate to="/student/login" replace />} />

      {/* Faculty routes */}
      <Route
        path="/faculty/login"
        element={user?.role === 'faculty'
          ? <Navigate to={dashboardPath(user)} replace />
          : <FacultyLogin onLogin={handleLogin} />}
      />
      <Route
        path="/faculty/signup"
        element={<Navigate to="/faculty/login" replace />}
      />

      {/* Admin route (no signup) */}
      <Route
        path="/admin/login"
        element={!user
          ? <AdminLogin onLogin={handleLogin} />
          : <Navigate to={dashboardPath(user)} replace />}
      />

      {/* Backward compat redirect */}
      <Route path="/signup" element={<Navigate to="/student/login" replace />} />

      {/* Dashboards */}
      <Route
        path="/admin/*"
        element={user?.role === 'admin'
          ? <AdminLayout user={user} onLogout={handleLogout} />
          : <Navigate to="/admin/login" replace />}
      />
      <Route
        path="/student"
        element={user?.role === 'student'
          ? <StudentDashboard user={user} onLogout={handleLogout} />
          : <Navigate to="/student/login" replace />}
      />
      <Route
        path="/faculty"
        element={user?.role === 'faculty'
          ? <FacultyDashboard user={user} onLogout={handleLogout} />
          : <Navigate to="/faculty/login" replace />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={dashboardPath(user)} replace />} />
    </Routes>
  );
}

export default App;
