import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

/* ─── nav items ─────────────────────────────── */
const NAV = [
  { id: 'dashboard',  label: 'Dashboard',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'profile',    label: 'Profile',        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'grades',     label: 'Grades',         icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'courses',    label: 'Courses',        icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'tasks',      label: 'Pending Tasks',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
];

/* ─── demo data ──────────────────────────────── */
const ANNOUNCEMENTS = [
  { id:1, title:'Enrollment Period Open',         date:'Mar 14, 2026', tag:'Important', color:'from-brand-500 to-amber-500',   desc:'Enrollment for 2nd semester is now open. Log in to the registrar portal and complete your enrollment form before the deadline.' },
  { id:2, title:'Mid-term Examination Schedule',  date:'Mar 12, 2026', tag:'Academic',  color:'from-blue-500 to-purple-500',   desc:'Mid-term exams are scheduled from March 20–25. Consult your professors for coverage and bring your exam permit.' },
  { id:3, title:'Academic Calendar Update',       date:'Mar 10, 2026', tag:'General',   color:'from-emerald-500 to-teal-500',  desc:'A revised academic calendar has been released for AY 2025–2026. Download it from the registrar page.' },
  { id:4, title:'IT Week 2026 – Call for Participants', date:'Mar 8, 2026', tag:'Event', color:'from-rose-500 to-pink-500', desc:'CCS IT Week 2026 is accepting participants for coding contests, tech talks, and hackathon. Register before Mar 17.' },
];

const GRADES = [
  { subject:'IT 111',   title:'Introduction to Computing',          units:3, prelim:'1.25', midterm:'1.50', final:'—' },
  { subject:'IT 121',   title:'Computer Programming 1',             units:3, prelim:'1.00', midterm:'1.25', final:'—' },
  { subject:'MATH 111', title:'Mathematics in the Modern World',    units:3, prelim:'1.75', midterm:'2.00', final:'—' },
  { subject:'ENGL 101', title:'Purposive Communication',            units:3, prelim:'1.50', midterm:'1.50', final:'—' },
  { subject:'PE 101',   title:'Physical Education 1',               units:2, prelim:'1.00', midterm:'1.00', final:'—' },
];

const COURSES = [
  { code:'IT 111',   title:'Introduction to Computing',         instructor:'Mr. Sample Faculty', schedule:'MWF 8:00–9:00 AM',    room:'IT Lab 1',    units:3, status:'Active' },
  { code:'IT 121',   title:'Computer Programming 1',            instructor:'Ms. Jane Doe',        schedule:'TTH 10:00–11:30 AM',  room:'Room 302',    units:3, status:'Active' },
  { code:'MATH 111', title:'Mathematics in the Modern World',   instructor:'Mr. John Smith',      schedule:'MWF 1:00–2:00 PM',    room:'Room 201',    units:3, status:'Active' },
  { code:'ENGL 101', title:'Purposive Communication',           instructor:'Ms. Reyes',           schedule:'TTH 1:00–2:30 PM',    room:'Room 104',    units:3, status:'Active' },
  { code:'PE 101',   title:'Physical Education 1',              instructor:'Coach Garcia',         schedule:'WF 3:00–4:30 PM',     room:'Gymnasium',   units:2, status:'Active' },
];

const TASKS_DEFAULT = [
  { id:1, subject:'IT 121',   title:'Programming Lab Exercise 3',          due:'Mar 20, 2026', priority:'High',   done:false },
  { id:2, subject:'MATH 111', title:'Problem Set 2 – Submission',          due:'Mar 18, 2026', priority:'High',   done:false },
  { id:3, subject:'ENGL 101', title:'Reflection Paper – Week 6',           due:'Mar 22, 2026', priority:'Medium', done:false },
  { id:4, subject:'IT 111',   title:'Read Chapter 5: Operating Systems',   due:'Mar 17, 2026', priority:'Low',    done:true  },
  { id:5, subject:'PE 101',   title:'Submit Medical Certificate',           due:'Mar 15, 2026', priority:'Medium', done:false },
];

const priorityStyle = (p) => ({
  High:   'bg-red-500/20   text-red-300   border border-red-500/30',
  Medium: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  Low:    'bg-slate-500/20 text-slate-300 border border-slate-500/30',
}[p] ?? '');

/* ─── main component ─────────────────────────── */
const StudentDashboard = ({ user, onLogout }) => {
  const [active,      setActive]      = useState('dashboard');
  const [tasks,       setTasks]       = useState(TASKS_DEFAULT);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'ST';
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  /* ── sidebar nav link ── */
  const NavLink = ({ item }) => {
    const isActive = active === item.id;
    return (
      <button
        onClick={() => { setActive(item.id); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
          ${isActive
            ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-[0_0_20px_rgba(242,101,34,0.15)]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
      >
        <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.icon} />
        </svg>
        {item.label}
        {item.id === 'tasks' && tasks.filter(t => !t.done).length > 0 && (
          <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center">
            {tasks.filter(t => !t.done).length}
          </span>
        )}
      </button>
    );
  };

  /* ════════════════════════════════
     PANEL: DASHBOARD
  ════════════════════════════════ */
  const DashboardPanel = () => (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600/20 via-purple-600/10 to-transparent border border-brand-500/20 p-6">
        <div className="absolute right-0 top-0 w-48 h-48 bg-brand-500/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">{initials}</div>
          <div>
            <p className="text-slate-400 text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold text-white">{user?.name} 👋</h2>
            <p className="text-slate-400 text-sm mt-0.5">CCS Student · Profile Hub</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label:'Enrolled Units',  val:'14',                                         icon:'📚', color:'from-brand-500/20 to-amber-500/10 border-brand-500/20'   },
          { label:'Active Subjects', val:COURSES.length,                               icon:'📖', color:'from-blue-500/20 to-purple-500/10 border-blue-500/20'    },
          { label:'Pending Tasks',   val:tasks.filter(t => !t.done).length,            icon:'✅', color:'from-red-500/20 to-pink-500/10 border-red-500/20'        },
          { label:'GPA (Prelim)',    val:'1.40',                                        icon:'🎓', color:'from-emerald-500/20 to-teal-500/10 border-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 bg-gradient-to-br ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-white">{s.val}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">📢 Announcements</h3>
        <div className="space-y-3">
          {ANNOUNCEMENTS.map(a => (
            <div key={a.id} className="flex gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 hover:border-slate-600 transition-all">
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 bg-gradient-to-b ${a.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <p className="text-sm font-semibold text-slate-200">{a.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${a.color} text-white`}>{a.tag}</span>
                    <span className="text-xs text-slate-500">{a.date}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════
     PANEL: PROFILE  (fetches real data)
  ════════════════════════════════ */
  const ProfilePanel = () => {
    const [student,  setStudent]  = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [fetchErr, setFetchErr] = useState(null);

    useEffect(() => {
      const load = async () => {
        if (!user?.student_id) { setLoading(false); return; }
        try {
          const data = await api.students.get(user.student_id);
          setStudent(data);
        } catch {
          setFetchErr('Could not load profile data from the server.');
        } finally {
          setLoading(false);
        }
      };
      load();
    }, []);

    const val = (v) => v || '—';
    const fmt = (d) => {
      try { return d ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }) : '—'; }
      catch { return d || '—'; }
    };

    /* reusable sub-components */
    const SectionCard = ({ title, icon, children }) => (
      <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-700/40 bg-slate-900/50">
          <span className="text-base">{icon}</span>
          <h4 className="text-xs font-bold uppercase tracking-widest text-brand-400">{title}</h4>
        </div>
        <div className="p-5 space-y-3">{children}</div>
      </div>
    );

    const Row = ({ label, value }) => (
      <div className="flex justify-between items-start gap-4">
        <span className="text-xs text-slate-500 shrink-0 w-44">{label}</span>
        <span className="text-xs font-medium text-slate-200 text-right break-words">{value}</span>
      </div>
    );

    const s = student;

    return (
      <div className="space-y-5">

        {/* ── Avatar card ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700/50 p-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl pointer-events-none" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">
              {s
                ? `${s.first_name}${s.middle_name ? ' ' + s.middle_name : ''} ${s.last_name}${s.suffix ? ' ' + s.suffix : ''}`
                : (user?.name ?? '—')
              }
            </h2>
            <p className="text-brand-400 font-medium mt-0.5 text-sm capitalize">{user?.role}</p>
            <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
            {user?.student_number && (
              <p className="text-slate-500 text-xs mt-0.5">Student No. {user.student_number}</p>
            )}
            {s && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✓ {s.enrollment_status ?? 'Enrolled'}
                </span>
                {s.year_level && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {s.year_level}
                  </span>
                )}
                {s.program && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-600/50 text-slate-300 border border-slate-600">
                    {s.program}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin" />
          </div>
        )}

        {/* ── Error ── */}
        {fetchErr && (
          <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm text-center">
            {fetchErr}
          </div>
        )}

        {/* ── 5 info sections ── */}
        {!loading && !fetchErr && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* 1. Personal Information */}
            <SectionCard title="Personal Information" icon="👤">
              <Row label="Gender"          value={val(s?.gender)} />
              <Row label="Civil Status"    value={val(s?.civil_status)} />
              <Row label="Residency"       value={val([s?.city, s?.province].filter(Boolean).join(', ') || null)} />
              <Row label="Nationality"     value={val(s?.nationality)} />
              <Row label="Religion"        value={val(s?.religion)} />
              <Row label="Date of Birth"   value={fmt(s?.birth_date)} />
              <Row label="Place of Birth"  value={val(s?.place_of_birth)} />
            </SectionCard>

            {/* 2. Contact Information */}
            <SectionCard title="Contact Information" icon="📞">
              <Row label="Present Address"
                value={val([s?.street, s?.barangay, s?.city, s?.province].filter(Boolean).join(', ') || null)} />
              <Row label="Permanent Address"
                value={val([s?.street, s?.barangay, s?.city, s?.province, s?.zip_code].filter(Boolean).join(', ') || null)} />
              <Row label="Mobile Number"   value={val(s?.contact_number)} />
              <Row label="Alt. Number"     value={val(s?.alternate_contact_number)} />
              <Row label="Email Address"   value={val(s?.email ?? user?.email)} />
            </SectionCard>

            {/* 3. Family Background */}
            <SectionCard title="Family Background" icon="👨‍👩‍👦">
              {(() => {
                const father   = s?.guardians?.find(g => g.relationship?.toLowerCase().includes('father'));
                const mother   = s?.guardians?.find(g => g.relationship?.toLowerCase().includes('mother'));
                const guardian = s?.guardians?.[0];
                return (
                  <>
                    <Row label="Father's Name"        value={val(father?.full_name)} />
                    <Row label="Father's Occupation"  value={val(father?.occupation)} />
                    <Row label="Mother's Name"        value={val(mother?.full_name)} />
                    <Row label="Mother's Occupation"  value={val(mother?.occupation)} />
                    <Row label="Guardian Contact No." value={val(guardian?.contact_number)} />
                  </>
                );
              })()}
            </SectionCard>

            {/* 4. Educational Background */}
            <SectionCard title="Educational Background" icon="🏫">
              <Row label="Last School Attended"      value={val(s?.last_school_attended)} />
              <Row label="Last Year Attended"        value={val(s?.last_year_attended)} />
              <Row label="Learner's Ref. No. (LRN)"  value={val(s?.lrn)} />
            </SectionCard>

            {/* 5. Enrollment Details */}
            <SectionCard title="Enrollment Details" icon="🎓">
              <Row label="Student Number"    value={val(s?.student_number)} />
              <Row label="College"           value="College of Computing Studies" />
              <Row label="Program"           value={val(s?.program)} />
              <Row label="Year Level"        value={val(s?.year_level)} />
              <Row label="Section"           value={val(s?.section)} />
              <Row label="Student Type"      value={val(s?.student_type)} />
              <Row label="Date Enrolled"     value={fmt(s?.date_enrolled)} />
              <Row label="Enrollment Status" value={val(s?.enrollment_status)} />
            </SectionCard>

          </div>
        )}
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: GRADES
  ════════════════════════════════ */
  const GradesPanel = () => {
    const avg = (GRADES.map(g => parseFloat(g.midterm)).reduce((a, b) => a + b, 0) / GRADES.length).toFixed(2);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/20 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">🎓</div>
          <div>
            <p className="text-slate-400 text-xs">Current Semester GPA (Midterm avg.)</p>
            <h2 className="text-3xl font-bold text-white">{avg}</h2>
            <p className="text-emerald-400 text-xs mt-0.5">Good Standing</p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/60">
            <h3 className="font-bold text-slate-200">Grade Report — AY 2025–2026, 1st Semester</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/60 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Subject</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Title</th>
                  <th className="px-5 py-3 text-center font-semibold">Units</th>
                  <th className="px-5 py-3 text-center font-semibold">Prelim</th>
                  <th className="px-5 py-3 text-center font-semibold">Midterm</th>
                  <th className="px-5 py-3 text-center font-semibold">Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {GRADES.map(g => (
                  <tr key={g.subject} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-brand-400">{g.subject}</td>
                    <td className="px-5 py-3.5 text-slate-300 hidden md:table-cell text-xs">{g.title}</td>
                    <td className="px-5 py-3.5 text-center text-slate-400">{g.units}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-200">{g.prelim}</td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-200">{g.midterm}</td>
                    <td className="px-5 py-3.5 text-center text-slate-500 italic">{g.final}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900/40 border-t border-slate-700/60">
                  <td colSpan={2} className="px-5 py-3 font-bold text-slate-300 text-xs uppercase">Total Units</td>
                  <td className="px-5 py-3 text-center font-bold text-brand-400">{GRADES.reduce((a, g) => a + g.units, 0)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ════════════════════════════════
     PANEL: COURSES
  ════════════════════════════════ */
  const CoursesPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Enrolled Subjects — 1st Semester 2025–2026</h3>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-full font-semibold">{COURSES.length} subjects</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {COURSES.map(c => (
          <div key={c.code} className="rounded-2xl bg-slate-800/50 border border-slate-700/40 hover:border-slate-600 transition-all p-5 group">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="text-xs font-bold text-brand-400 tracking-wider">{c.code}</span>
                <h4 className="font-bold text-slate-200 mt-0.5 group-hover:text-white transition-colors">{c.title}</h4>
              </div>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full shrink-0">{c.units} units</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {c.instructor}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {c.schedule}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {c.room}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/40">
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">✓ {c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ════════════════════════════════
     PANEL: TASKS
  ════════════════════════════════ */
  const TasksPanel = () => {
    const pending = tasks.filter(t => !t.done);
    const done    = tasks.filter(t =>  t.done);
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-slate-800/50 border border-slate-700/40 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-200">Task Progress</h3>
            <span className="text-xs text-slate-400">{done.length} / {tasks.length} completed</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(done.length / tasks.length) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{pending.length} pending {pending.length === 1 ? 'task' : 'tasks'} remaining</p>
        </div>

        {pending.length > 0 && (
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">📋 Pending</h3>
            <div className="space-y-3">
              {pending.map(t => (
                <div key={t.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 hover:border-slate-600 transition-all">
                  <button onClick={() => toggleTask(t.id)}
                    className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-brand-500 mt-0.5 shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">{t.subject}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityStyle(t.priority)}`}>{t.priority}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 mt-1">{t.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Due: {t.due}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">✅ Completed</h3>
            <div className="space-y-2">
              {done.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/20 opacity-60">
                  <button onClick={() => toggleTask(t.id)}
                    className="w-5 h-5 rounded-full bg-emerald-500/30 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-400 line-through">{t.title}</p>
                    <p className="text-xs text-slate-600">{t.subject} · {t.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ── panel map ── */
  const panels    = { dashboard: <DashboardPanel />, profile: <ProfilePanel />, grades: <GradesPanel />, courses: <CoursesPanel />, tasks: <TasksPanel /> };
  const activeNav = NAV.find(n => n.id === active);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top nav */}
      <header className="relative z-30 flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(s => !s)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(242,101,34,0.4)]">
            <img src="/ccs_logo.jpg" alt="CCS" className="w-6 h-6 object-contain rounded-lg" onError={e => { e.target.style.display='none'; }} />
          </div>
          <div>
            <h1 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-amber-400 leading-none">Profile Hub</h1>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Student Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/50 px-3 py-2 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-slate-200 leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-xs font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {sidebarOpen && <div className="fixed inset-0 bg-slate-950/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`fixed md:relative inset-y-0 left-0 z-30 w-64 shrink-0 bg-slate-900/95 md:bg-slate-900/50 border-r border-slate-800/60 backdrop-blur-xl flex flex-col h-full md:h-auto overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-5 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">{initials}</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role} · CCS</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map(item => <NavLink key={item.id} item={item} />)}
          </nav>
          <div className="p-3 border-t border-slate-800/60">
            <button onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center gap-3">
            <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={activeNav?.icon} />
            </svg>
            <h2 className="text-base font-bold text-slate-100">{activeNav?.label}</h2>
          </div>
          <div className="p-6">{panels[active]}</div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
