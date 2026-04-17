import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../utils/api';
import { Pin, PinOff } from 'lucide-react';

const ThemeCtx = createContext(true);
const useTheme = () => useContext(ThemeCtx);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'profile',   label: 'My Profile',  icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'subjects',  label: 'My Subjects', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'schedule',  label: 'My Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'students',  label: 'My Students', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
];

const ANNOUNCEMENTS = [
  { id: 1, title: 'Mid-term Grades Submission Deadline', date: 'Mar 22, 2026', tag: 'Deadline', color: 'from-red-500 to-pink-500',    desc: 'Please submit all mid-term grades through the faculty portal before March 22, 2026.' },
  { id: 2, title: 'Faculty Meeting — March 16, 2026',    date: 'Mar 16, 2026', tag: 'Meeting',  color: 'from-blue-500 to-purple-500', desc: 'Mandatory faculty meeting at 2:00 PM in the CCS Conference Room. Attendance is required.' },
  { id: 3, title: 'New Section Added to Your Schedule',  date: 'Mar 10, 2026', tag: 'Update',   color: 'from-emerald-500 to-teal-500',desc: 'Section BSIT-3A has been added to your schedule for IT 311 starting March 17.' },
  { id: 4, title: 'IT Week 2026 — Faculty Coordinators', date: 'Mar 8, 2026',  tag: 'Event',    color: 'from-brand-500 to-amber-500', desc: 'Faculty coordinators for IT Week 2026 are requested to submit their event proposals by March 15.' },
];

/* ── helpers ── */
const fmt = (d) => { try { return d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : '—'; } catch { return d||'—'; } };
const val = (v) => (v!==null&&v!==undefined&&v!=='') ? v : '—';
const mkInp = (dark) => dark
  ? 'w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition'
  : 'w-full rounded-xl bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition';
const mkLbl = (dark) => `block text-xs font-semibold mb-1.5 uppercase tracking-wide ${dark?'text-slate-400':'text-slate-500'}`;
const fmtTime = (t) => { if(!t) return '—'; const [h,m]=t.split(':'); const hr=parseInt(h); return `${hr%12||12}:${m} ${hr<12?'AM':'PM'}`; };

/* ── UI atoms ── */
const Spinner = () => { const dark=useTheme(); return <div className="flex items-center justify-center py-16"><div className={`w-8 h-8 border-4 rounded-full animate-spin border-t-brand-500 ${dark?'border-slate-700':'border-slate-200'}`}/></div>; };
const ErrMsg = ({msg}) => msg ? <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-800/50 text-red-400 text-sm">{msg}</div> : null;

const SectionCard = ({title,action,children}) => {
  const dark=useTheme();
  return (
    <div className={`rounded-2xl border overflow-hidden ${dark?'bg-slate-900 border-slate-700/60':'bg-white border-slate-200 shadow-sm'}`}>
      <div className={`flex items-center justify-between px-5 py-3.5 border-b ${dark?'border-slate-700/60':'border-slate-100'}`}>
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-px bg-orange-400 shrink-0"/>
          <h4 className={`text-xs font-bold uppercase tracking-widest ${dark?'text-orange-400':'text-orange-500'}`}>{title}</h4>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
};

const Row = ({label,value}) => {
  const dark=useTheme();
  return (
    <div className="flex justify-between items-center gap-4 py-2 border-b last:border-0" style={{borderColor:dark?'rgba(100,116,139,0.15)':'rgba(226,232,240,0.8)'}}>
      <span className={`text-xs shrink-0 ${dark?'text-slate-500':'text-slate-400'}`}>{label}</span>
      <span className={`text-xs font-semibold text-right break-words ${dark?'text-slate-200':'text-slate-800'}`}>{value}</span>
    </div>
  );
};

const BtnEdit = ({onClick,label='Edit'}) => {
  const dark=useTheme();
  return <button onClick={onClick} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${dark?'text-slate-400 hover:text-slate-200 hover:bg-slate-700':'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>{label}</button>;
};

const BtnDanger = ({onClick,loading,children}) => (
  <button onClick={onClick} disabled={loading} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50">
    {loading?<div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"/>:children}
  </button>
);

const AddBtn = ({onClick,label}) => (
  <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-500 text-xs font-semibold transition-all">
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>{label}
  </button>
);

const BtnPrimary = ({children,loading,onClick,disabled}) => (
  <button onClick={onClick} disabled={loading||disabled} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all disabled:opacity-50">
    {loading?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:children}
  </button>
);

const BtnGhost = ({children,onClick}) => {
  const dark=useTheme();
  return <button onClick={onClick} className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${dark?'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300':'bg-white hover:bg-slate-50 border-slate-300 text-slate-600'}`}>{children}</button>;
};

const FModal = ({title,onClose,children,footer,wide}) => {
  const dark=useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 backdrop-blur-md ${dark?'bg-slate-950/40':'bg-slate-900/20'}`} onClick={onClose}/>
      <div className={`relative w-full border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${wide?'max-w-3xl':'max-w-2xl'} ${dark?'bg-slate-900 border-slate-700/60':'bg-white border-slate-200'}`}>
        <div className={`flex items-center justify-between px-6 py-5 border-b ${dark?'border-slate-700/60':'border-slate-100'}`}>
          <h3 className={`text-base font-bold ${dark?'text-slate-100':'text-slate-800'}`}>{title}</h3>
          <button onClick={onClose} className={`transition-colors ${dark?'text-slate-500 hover:text-slate-300':'text-slate-400 hover:text-slate-600'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {footer&&<div className={`px-6 py-4 border-t flex justify-end gap-3 ${dark?'border-slate-700/60 bg-slate-900':'border-slate-100 bg-slate-50'}`}>{footer}</div>}
      </div>
    </div>
  );
};

const NavLink = ({item,active,sidebarExpanded,onSelect}) => {
  const dark=useTheme(); const isActive=active===item.id;
  return (
    <button onClick={()=>onSelect(item.id)} title={!sidebarExpanded?item.label:''}
      className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 group relative ${sidebarExpanded?'px-4':'px-0 justify-center'} ${isActive?'bg-brand-600/10 text-brand-400 ring-1 ring-brand-500/50':dark?'text-slate-400 hover:bg-slate-800 hover:text-slate-200':'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
      {isActive&&<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand-500 rounded-r-full shadow-[0_0_10px_rgba(242,101,34,0.6)]"/>}
      <svg className={`w-5 h-5 shrink-0 transition-all duration-300 ${sidebarExpanded?'mr-3':'mr-0'} ${isActive?'text-brand-400':dark?'text-slate-500 group-hover:text-slate-300':'text-slate-400 group-hover:text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={item.icon}/>
      </svg>
      <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 text-sm ${sidebarExpanded?'opacity-100 w-auto inline-block':'opacity-0 w-0 hidden'}`}>{item.label}</span>
    </button>
  );
};

/* ════ DASHBOARD PANEL ════ */
const DashboardPanel = ({user,facultyName,initials,subjectsCount,studentsCount,schedulesCount}) => {
  const dark=useTheme();
  const stats=[
    {label:'Subjects Handled',val:subjectsCount,icon:'📚',dc:'from-blue-500/20 to-purple-500/10 border-blue-500/20',lc:'bg-blue-50 border-blue-100'},
    {label:'Total Students',  val:studentsCount, icon:'👥',dc:'from-brand-500/20 to-amber-500/10 border-brand-500/20',lc:'bg-orange-50 border-orange-100'},
    {label:'Schedules',       val:schedulesCount,icon:'🗂️',dc:'from-emerald-500/20 to-teal-500/10 border-emerald-500/20',lc:'bg-emerald-50 border-emerald-100'},
    {label:'Upcoming Events', val:'2',           icon:'📅',dc:'from-rose-500/20 to-pink-500/10 border-rose-500/20',lc:'bg-rose-50 border-rose-100'},
  ];
  return (
    <div className="space-y-6">
      <div className={`relative overflow-hidden rounded-2xl border p-6 ${dark?'bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border-blue-500/20':'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100'}`}>
        <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-1/4 translate-x-1/4 blur-2xl pointer-events-none"/>
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0">{initials}</div>
          <div>
            <p className={`text-sm ${dark?'text-slate-400':'text-slate-500'}`}>Welcome back,</p>
            <h2 className={`text-2xl font-bold ${dark?'text-white':'text-slate-800'}`}>{facultyName||user?.name} 👋</h2>
            <p className={`text-sm mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>CCS Faculty Member · Profile Hub</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(s=>(
          <div key={s.label} className={`rounded-2xl border p-4 ${dark?`bg-gradient-to-br ${s.dc}`:s.lc}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${dark?'text-white':'text-slate-800'}`}>{s.val}</div>
            <div className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{s.label}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${dark?'text-slate-400':'text-slate-500'}`}>📢 Announcements</h3>
        <div className="space-y-3">
          {ANNOUNCEMENTS.map(a=>(
            <div key={a.id} className={`flex gap-4 p-4 rounded-2xl border transition-all ${dark?'bg-slate-900 border-slate-700/60 hover:border-slate-600':'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 bg-gradient-to-b ${a.color}`}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <p className={`text-sm font-semibold ${dark?'text-slate-200':'text-slate-700'}`}>{a.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${a.color} text-white`}>{a.tag}</span>
                    <span className={`text-xs ${dark?'text-slate-500':'text-slate-400'}`}>{a.date}</span>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed ${dark?'text-slate-400':'text-slate-500'}`}>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════ PROFILE MODALS ════ */

// These helpers must be defined outside modals to prevent remounting on every keystroke
const ModalSectionHeader = ({label,dark}) => (
  <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark?'text-orange-400':'text-orange-500'}`}>
    <span className="w-4 h-px bg-orange-400"/>{label}
  </p>
);
const ModalSectionCard = ({label,dark,children}) => (
  <div className={`p-4 rounded-xl border ${dark?'bg-slate-800/40 border-slate-700/60':'bg-slate-50/60 border-slate-100'}`}>
    <ModalSectionHeader label={label} dark={dark}/>{children}
  </div>
);

const BasicInfoModal = ({faculty,onClose,onSaved}) => {
  const dark=useTheme();
  const [form,setForm]=useState({
    first_name:faculty.first_name??'',
    middle_name:faculty.middle_name??'',
    last_name:faculty.last_name??'',
    position:faculty.position??'',
    department_id:faculty.department_id??'',
    employment_status:faculty.employment_status??'',
    hire_date:faculty.hire_date?faculty.hire_date.split('T')[0]:'',
    email:faculty.email??'',
    contact_number:faculty.contact_number??'',
    office_location:faculty.office_location??'',
  });
  const [depts,setDepts]=useState([]);
  const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const [photoUploading,setPhotoUploading]=useState(false);
  const [photoErr,setPhotoErr]=useState(null);
  const [localPhotoUrl,setLocalPhotoUrl]=useState(
    faculty.profile_photo
      ? (faculty.profile_photo.startsWith('http')
          ? faculty.profile_photo
          : `${import.meta.env.VITE_STORAGE_URL||'http://localhost:8000/storage'}/${faculty.profile_photo}?v=${faculty.updated_at??Date.now()}`)
      : null
  );
  const initials=`${faculty.first_name?.[0]??''}${faculty.last_name?.[0]??''}`.toUpperCase();

  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  useEffect(()=>{api.departments.getAll().then(setDepts).catch(()=>{});},[]);

  const handlePhoto=async(e)=>{
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>10*1024*1024){setPhotoErr('Max 10 MB.');e.target.value='';return;}
    setPhotoErr(null);setPhotoUploading(true);
    try{
      await api.faculties.uploadPhoto(faculty.id,file);
      // Show preview immediately
      setLocalPhotoUrl(URL.createObjectURL(file));
    }catch(ex){setPhotoErr(ex.message||'Upload failed.');}
    finally{setPhotoUploading(false);e.target.value='';}
  };

  const save=async(e)=>{e?.preventDefault();setSaving(true);setErr(null);try{await api.faculties.update(faculty.id,form);onSaved();}catch(ex){setErr(ex.message||'Failed to save.');}finally{setSaving(false);}};

  // AddFacultyModal-style tokens
  const modalBg  = dark?'bg-slate-900 border-slate-700/60':'bg-white border-slate-200';
  const boldText = dark?'text-slate-100':'text-slate-800';
  const subText  = dark?'text-slate-400':'text-slate-500';
  const divider  = dark?'border-slate-700/60':'border-slate-100';
  const footerBg = dark?'bg-slate-800/60 border-slate-700/60':'bg-slate-50 border-slate-100';
  const inp = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors ${dark?'bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-orange-400':'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20'}`;
  const sel = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors ${dark?'bg-slate-800 border-slate-600 text-slate-100 focus:border-orange-400':'bg-white border-slate-200 text-slate-900 focus:border-orange-400'}`;
  const lbl = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${dark?'text-slate-400':'text-slate-500'}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className={`fixed inset-0 backdrop-blur-md ${dark?'bg-slate-950/40':'bg-slate-900/20'}`} onClick={onClose}/>
      <div className="flex min-h-full items-center justify-center p-4 sm:p-0">
        <div className={`relative transform overflow-hidden rounded-2xl text-left shadow-2xl sm:my-8 w-full sm:max-w-4xl border ${modalBg}`}>

          {/* Hero header with photo upload */}
          <div className={`px-6 pt-6 pb-5 border-b ${divider} ${dark?'bg-gradient-to-br from-slate-800 to-slate-900':'bg-gradient-to-br from-orange-50/60 to-white'}`}>
            <div className="flex items-center gap-5">
              {/* Clickable photo circle */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {photoUploading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    : localPhotoUrl
                      ? <img src={localPhotoUrl} alt="Profile" className="w-full h-full object-cover object-top"/>
                      : <span>{initials}</span>}
                </div>
                {!photoUploading&&(
                  <><label htmlFor="modal-photo-upload" className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer gap-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span className="text-white text-[9px] font-semibold">Change</span>
                  </label>
                  <input id="modal-photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhoto}/></>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${dark?'text-orange-400':'text-orange-500'}`}>CCS Profiling System</p>
                <h3 className={`text-lg font-extrabold leading-tight ${boldText}`}>Edit Faculty Profile</h3>
                <p className={`text-xs mt-0.5 ${subText}`}>Update your personal, employment and contact details.</p>
                {photoErr&&<p className="text-xs text-red-400 mt-1">{photoErr}</p>}
              </div>
            </div>
          </div>

          {/* Form body — no wrapper components inside, only plain divs to avoid remount */}
          <form onSubmit={save} className="px-6 py-5 overflow-y-auto max-h-[60vh]">
            {err&&(
              <div className={`mb-5 border-l-4 border-red-500 p-3.5 rounded-xl flex items-center gap-3 ${dark?'bg-red-900/30 text-red-300':'bg-red-50 text-red-700'}`}>
                <svg className="h-4 w-4 text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                <p className="text-sm">{err}</p>
              </div>
            )}
            <div className="space-y-4">
              {/* Personal Information */}
              <div className={`p-4 rounded-xl border ${dark?'bg-slate-800/40 border-slate-700/60':'bg-slate-50/60 border-slate-100'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark?'text-orange-400':'text-orange-500'}`}><span className="w-4 h-px bg-orange-400"/>Personal Information</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><label className={lbl}>First Name *</label><input required className={inp} value={form.first_name} onChange={set('first_name')}/></div>
                  <div><label className={lbl}>Middle Name</label><input className={inp} value={form.middle_name} onChange={set('middle_name')}/></div>
                  <div><label className={lbl}>Last Name *</label><input required className={inp} value={form.last_name} onChange={set('last_name')}/></div>
                </div>
              </div>
              {/* Employment Details */}
              <div className={`p-4 rounded-xl border ${dark?'bg-slate-800/40 border-slate-700/60':'bg-slate-50/60 border-slate-100'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark?'text-orange-400':'text-orange-500'}`}><span className="w-4 h-px bg-orange-400"/>Employment Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label className={lbl}>Position *</label><input required className={inp} value={form.position} onChange={set('position')} placeholder="e.g. Associate Professor"/></div>
                  <div><label className={lbl}>Department *</label>
                    <select required className={sel} value={form.department_id} onChange={set('department_id')}>
                      <option value="">Select Department</option>
                      {depts.map(d=><option key={d.id} value={d.id}>{d.department_name}</option>)}
                    </select>
                  </div>
                  <div><label className={lbl}>Employment Status</label>
                    <select className={sel} value={form.employment_status} onChange={set('employment_status')}>
                      <option>Full-Time</option><option>Part-Time</option><option>Adjunct</option><option>Contract</option>
                    </select>
                  </div>
                  <div><label className={lbl}>Hire Date</label><input type="date" className={inp} value={form.hire_date} onChange={set('hire_date')} max={new Date().toISOString().split('T')[0]}/></div>
                </div>
              </div>
              {/* Contact & Location */}
              <div className={`p-4 rounded-xl border ${dark?'bg-slate-800/40 border-slate-700/60':'bg-slate-50/60 border-slate-100'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark?'text-orange-400':'text-orange-500'}`}><span className="w-4 h-px bg-orange-400"/>Contact &amp; Location</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><label className={lbl}>Email Address *</label><input required type="email" className={inp} value={form.email} onChange={set('email')} placeholder="e.g. faculty@pnc.edu.ph"/></div>
                  <div><label className={lbl}>Contact Number</label><input className={inp} value={form.contact_number} onChange={set('contact_number')} placeholder="09XXXXXXXXX"/></div>
                  <div><label className={lbl}>Office Location</label><input className={inp} value={form.office_location} onChange={set('office_location')} placeholder="e.g. Room 402, IT Bldg"/></div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className={`px-6 py-3 flex justify-end gap-3 border-t ${footerBg}`}>
            <button type="button" onClick={onClose}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${dark?'bg-slate-700 hover:bg-slate-600 text-slate-200':'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}>
              Cancel
            </button>
            <button type="button" onClick={save} disabled={saving}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-50 flex items-center gap-2 min-w-[120px] justify-center">
              {saving?<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</>:'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactModal = ({faculty,onClose,onSaved}) => { return null; };
const ProfessionalInfoModal = ({faculty,onClose,onSaved,depts}) => { return null; };

const EducationModal = ({faculty,onClose,onSaved}) => {
  const dark=useTheme();
  const emptyDeg=()=>({course:'',school:'',year_graduated:''});
  const [bachelors,setBachelors]=useState(faculty.bachelors_degree??emptyDeg());
  const [masters,setMasters]=useState(faculty.masters_degree??emptyDeg());
  const [doctorate,setDoctorate]=useState(faculty.doctorate_degree??emptyDeg());
  const [certs,setCerts]=useState(faculty.certifications??[]);
  const [certInput,setCertInput]=useState('');
  const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  const DegFields=({label,val,setVal})=>(
    <div className={`p-4 rounded-xl border ${dark?'bg-slate-900 border-slate-700/60':'bg-slate-50 border-slate-200'}`}>
      <p className={`text-xs font-bold mb-3 ${dark?'text-orange-400':'text-orange-500'}`}>{label}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div><label className={lbl}>Course / Program</label><input className={inp} value={val.course??''} onChange={e=>setVal(v=>({...v,course:e.target.value}))} placeholder="e.g. BS Computer Science"/></div>
        <div><label className={lbl}>School / University</label><input className={inp} value={val.school??''} onChange={e=>setVal(v=>({...v,school:e.target.value}))} placeholder="e.g. University of the Philippines"/></div>
        <div><label className={lbl}>Year Graduated</label><input className={inp} value={val.year_graduated??''} onChange={e=>setVal(v=>({...v,year_graduated:e.target.value}))} placeholder="e.g. 2015"/></div>
      </div>
    </div>
  );
  const addCert=()=>{if(!certInput.trim())return;setCerts(c=>[...c,certInput.trim()]);setCertInput('');};
  const save=async()=>{
    setSaving(true);setErr(null);
    try{await api.faculties.update(faculty.id,{bachelors_degree:bachelors,masters_degree:masters,doctorate_degree:doctorate,certifications:certs}); onSaved();onClose();}
    catch(e){setErr(e.message);}finally{setSaving(false);}
  };
  return (
    <FModal title="Edit Educational Background" onClose={onClose} wide footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="space-y-4">
        <DegFields label="Bachelor's Degree" val={bachelors} setVal={setBachelors}/>
        <DegFields label="Master's Degree" val={masters} setVal={setMasters}/>
        <DegFields label="Doctorate Degree (if applicable)" val={doctorate} setVal={setDoctorate}/>
        <div>
          <label className={lbl}>Certifications / Trainings</label>
          <div className="flex gap-2 mb-2"><input className={`${inp} flex-1`} value={certInput} onChange={e=>setCertInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addCert())} placeholder="e.g. AWS Certified Developer"/><button type="button" onClick={addCert} className="px-3 py-2 rounded-xl text-xs font-bold text-white" style={{background:'linear-gradient(135deg,#f26522,#e04f0f)'}}>Add</button></div>
          <div className="flex flex-wrap gap-2">{certs.map((c,i)=>(<span key={i} className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${dark?'bg-slate-800 border-slate-700 text-slate-300':'bg-slate-100 border-slate-200 text-slate-600'}`}>{c}<button onClick={()=>setCerts(cs=>cs.filter((_,idx)=>idx!==i))} className="text-red-400 hover:text-red-300">×</button></span>))}</div>
        </div>
      </div>
    </FModal>
  );
};

const TextFieldModal = ({title,fieldKey,value,faculty,onClose,onSaved}) => {
  const dark=useTheme();const [text,setText]=useState(value??'');const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const save=async()=>{setSaving(true);setErr(null);try{await api.faculties.update(faculty.id,{[fieldKey]:text}); onSaved();}catch(e){setErr(e.message);}finally{setSaving(false);}};
  return (
    <FModal title={title} onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save</BtnPrimary></>}>
      <ErrMsg msg={err}/><textarea className={`${mkInp(dark)} resize-none`} rows={6} value={text} onChange={e=>setText(e.target.value)} placeholder="Write here..."/>
    </FModal>
  );
};

const SocialLinksModal = ({faculty,onClose,onSaved}) => {
  const dark=useTheme();
  const [form,setForm]=useState({linkedin:'',researchgate:'',orcid:'',website:'',twitter:'',...(faculty.social_links??{})});
  const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{setSaving(true);setErr(null);try{await api.faculties.update(faculty.id,{social_links:form}); onSaved();}catch(e){setErr(e.message);}finally{setSaving(false);}};
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title="Edit Social & Professional Links" onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="space-y-4">
        {[['linkedin','LinkedIn URL'],['researchgate','ResearchGate URL'],['orcid','ORCID URL'],['website','Personal Website'],['twitter','Twitter / X URL']].map(([k,label])=>(
          <div key={k}><label className={lbl}>{label}</label><input className={inp} value={form[k]} onChange={set(k)} placeholder="https://..."/></div>
        ))}
      </div>
    </FModal>
  );
};

const ListEditorModal = ({title,items,fields,onClose,onSave}) => {
  const dark=useTheme();
  const [list,setList]=useState(items?.length?items.map(i=>({...i})):[]);
  const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const addRow=()=>setList(l=>[...l,Object.fromEntries(fields.map(f=>[f.key,'']))]);
  const removeRow=(i)=>setList(l=>l.filter((_,idx)=>idx!==i));
  const setField=(i,k,v)=>setList(l=>l.map((row,idx)=>idx===i?{...row,[k]:v}:row));
  const save=async()=>{setSaving(true);setErr(null);try{await onSave(list.filter(r=>Object.values(r).some(v=>v)));onClose();}catch(e){setErr(e.message);}finally{setSaving(false);}};
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title={title} onClose={onClose} wide footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>Save</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="space-y-4">
        {list.map((row,i)=>(
          <div key={i} className={`p-4 rounded-xl border relative ${dark?'bg-slate-900 border-slate-700/60':'bg-slate-50 border-slate-200'}`}>
            <button onClick={()=>removeRow(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-300 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
              {fields.map(f=>(
                <div key={f.key} className={f.full?'sm:col-span-2':''}>
                  <label className={lbl}>{f.label}</label>
                  {f.textarea
                    ?<textarea className={`${inp} resize-none`} rows={2} value={row[f.key]??''} onChange={e=>setField(i,f.key,e.target.value)} placeholder={f.placeholder??''}/>
                    :<input className={inp} value={row[f.key]??''} onChange={e=>setField(i,f.key,e.target.value)} placeholder={f.placeholder??''}/>
                  }
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={addRow} className="w-full py-2.5 rounded-xl border-2 border-dashed text-xs font-semibold transition-all flex items-center justify-center gap-2" style={{borderColor:'rgba(242,101,34,0.3)',color:'rgb(242,101,34)'}}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>Add Entry
        </button>
      </div>
    </FModal>
  );
};

/* ════ PROFILE PANEL ════ */
const ProfilePanel = ({faculty,loading,err,onReload}) => {
  const dark=useTheme();
  const [modal,setModal]=useState(null);
  const [photoUploading,setPhotoUploading]=useState(false);
  const [photoErr,setPhotoErr]=useState(null);
  const [depts,setDepts]=useState([]);

  useEffect(()=>{api.departments.getAll().then(setDepts).catch(()=>{});},[]);

  const refresh=async()=>{
    setModal(null);
    await onReload();
  };

  const handlePhoto=async(e)=>{
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>10*1024*1024){setPhotoErr('Max 10 MB.');e.target.value='';return;}
    setPhotoErr(null);setPhotoUploading(true);
    try{await api.faculties.uploadPhoto(faculty.id,file);await onReload();}
    catch(ex){setPhotoErr(ex.message||'Upload failed.');}
    finally{setPhotoUploading(false);e.target.value='';}
  };

  if(loading) return <Spinner/>;
  if(err) return <div className={`rounded-2xl border p-8 text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}><p className="text-red-400 text-sm">{err}</p></div>;
  if(!faculty) return null;

  const f=faculty;
  const fullName=[f.first_name,f.middle_name?f.middle_name[0]+'.':null,f.last_name].filter(Boolean).join(' ');
  const initials=`${f.first_name?.[0]??''}${f.last_name?.[0]??''}`.toUpperCase();
  const photoUrl=f.profile_photo?`${import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage"}/${f.profile_photo}?v=${f.updated_at??Date.now()}`:null;

  // StudentProfileTabs-style tokens
  const wrap     = dark?'bg-slate-900 border-slate-700/60':'bg-white border-slate-100';
  const boldText = dark?'text-slate-100':'text-slate-800';
  const subText  = dark?'text-slate-400':'text-slate-500';
  const divider  = dark?'border-slate-700/60':'border-slate-100';
  const valueRow = dark?'text-slate-200':'text-slate-800';
  const editBtn  = dark?'text-slate-300 bg-slate-700 hover:bg-slate-600 hover:text-slate-100':'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900';
  const cardBg   = dark?'bg-slate-800/40 border-slate-700/60':'bg-slate-50/60 border-slate-100';

  const SecHead=({label})=>(
    <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 ${dark?'text-orange-400':'text-orange-500'}`}>
      <span className="w-4 h-px bg-orange-400"/>{label}
    </p>
  );
  const DataRow=({label,value,highlight})=>(
    <div className={`flex items-center justify-between py-2.5 border-b last:border-0 ${dark?'border-slate-700/60':'border-slate-100'}`}>
      <span className={`text-xs font-semibold ${dark?'text-slate-500':'text-slate-400'}`}>{label}</span>
      <span className={`text-sm font-semibold ${highlight?dark?'text-orange-400':'text-orange-600':valueRow}`}>{value||'N/A'}</span>
    </div>
  );

  return (
    <div className={`p-6 rounded-2xl shadow-sm border min-h-[500px] transition-colors duration-300 ${wrap}`}>
      {modal==='basic'&&<BasicInfoModal faculty={f} onClose={()=>setModal(null)} onSaved={refresh}/>}

      {/* Header — StudentProfileTabs style */}
      <div className={`flex items-center space-x-6 mb-8 pb-6 border-b ${divider}`}>
        {/* Circular photo */}
        <div className="relative group w-20 h-20 rounded-full shrink-0 overflow-hidden bg-gradient-to-tr from-blue-500 to-purple-500">
          {/* Photo layer */}
          {photoUrl&&<img src={photoUrl} alt="Profile" className="absolute inset-0 w-full h-full object-cover object-top z-10"/>}
          {/* Initials fallback layer */}
          <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-white">
            {initials}
          </div>
          {/* Upload overlay */}
          {!photoUploading&&(
            <><label htmlFor="faculty-photo" className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg></label><input id="faculty-photo" type="file" accept="image/*" className="hidden" onChange={handlePhoto}/></>
          )}
          {photoUploading&&<div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center z-20"><div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/></div>}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h2 className={`text-2xl font-bold ${boldText}`}>{fullName||'—'}</h2>
            {/* Edit only — no delete */}
            <button onClick={()=>setModal('basic')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center shrink-0 ${editBtn}`}>
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit
            </button>
          </div>
          {photoErr&&<p className="text-xs text-red-400 mt-1">{photoErr}</p>}
          <div className={`flex flex-wrap items-center gap-4 mt-2 text-sm ${subText}`}>
            {f.employee_id&&(
              <span className="flex items-center gap-1">
                <svg className={`w-4 h-4 ${dark?'text-slate-500':'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>
                Faculty ID: {f.employee_id}
              </span>
            )}
            {(f.department?.department_name||f.position)&&(
              <span className="flex items-center gap-1">
                <svg className={`w-4 h-4 ${dark?'text-slate-500':'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                {[f.department?.department_name,f.position].filter(Boolean).join(' · ')}
              </span>
            )}
            {f.employment_status&&(
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                f.employment_status==='Full-Time'
                  ? dark?'bg-green-900/40 text-green-300 border border-green-700':'bg-green-100 text-green-800 border border-green-200'
                  : dark?'bg-amber-900/40 text-amber-300 border border-amber-700':'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>{f.employment_status}</span>
            )}
          </div>
        </div>
      </div>

      {/* Section cards — reorganized layout */}
      <div className="space-y-5">
        {/* Row 1: Personal Info + Contact & Location side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Personal Information */}
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <SecHead label="Personal Information"/>
            <DataRow label="First Name"  value={f.first_name}/>
            <DataRow label="Middle Name" value={f.middle_name}/>
            <DataRow label="Last Name"   value={f.last_name}/>
          </div>

          {/* Contact & Location */}
          <div className={`rounded-2xl border p-5 ${cardBg}`}>
            <SecHead label="Contact & Location"/>
            <DataRow label="Email Address"   value={f.email} highlight/>
            <DataRow label="Contact Number"  value={f.contact_number}/>
            <DataRow label="Office Location" value={f.office_location}/>
          </div>
        </div>

        {/* Row 2: Employment Details — full width */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <SecHead label="Employment Details"/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <DataRow label="Position"          value={f.position}/>
            <DataRow label="Department"        value={f.department?.department_name}/>
            <DataRow label="Employment Status" value={f.employment_status}/>
            <DataRow label="Hire Date"         value={f.hire_date?new Date(f.hire_date).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):null}/>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════ MY SUBJECTS PANEL ════ */
const SubjectDetailModal = ({subject,students,schedules,onClose}) => {
  const dark=useTheme();
  const subjectSchedules=schedules.filter(s=>s.subject_id===subject.id);
  const sections=[...new Set(subjectSchedules.map(s=>s.section?.section_name).filter(Boolean))];
  const enrolledStudents=students.filter(s=>s.section&&sections.includes(s.section));
  return (
    <FModal title={`${subject.subject_code} — ${subject.descriptive_title}`} onClose={onClose} wide>
      <div className="space-y-5">
        {/* Subject Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[['Total Units',subject.total_units],['Lec Units',subject.lec_units],['Lab Units',subject.lab_units],['Pre-requisite',subject.pre_requisites||'None']].map(([l,v])=>(
            <div key={l} className={`rounded-xl border p-3 text-center ${dark?'bg-slate-900 border-slate-700/60':'bg-slate-50 border-slate-200'}`}>
              <p className={`text-lg font-bold ${dark?'text-white':'text-slate-800'}`}>{v}</p>
              <p className={`text-[10px] mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>{l}</p>
            </div>
          ))}
        </div>
        {/* Schedules */}
        <SectionCard title="Class Schedules" icon="🗓️">
          {subjectSchedules.length===0?<p className={`text-xs text-center py-3 ${dark?'text-slate-500':'text-slate-400'}`}>No schedules found.</p>:(
            <div className="space-y-2">
              {subjectSchedules.map(s=>(
                <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dark?'bg-slate-900 border-slate-700/60':'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-xs font-bold w-24 shrink-0 ${dark?'text-brand-400':'text-brand-600'}`}>{s.day_of_week}</span>
                  <span className={`text-xs ${dark?'text-slate-300':'text-slate-700'}`}>{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</span>
                  <span className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>{s.section?.section_name} · {s.room}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        {/* Enrolled Students */}
        <SectionCard title={`Enrolled Students (${enrolledStudents.length})`} icon="👥">
          {enrolledStudents.length===0?<p className={`text-xs text-center py-3 ${dark?'text-slate-500':'text-slate-400'}`}>No students found in assigned sections.</p>:(
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {enrolledStudents.map(s=>{
                const initials=`${s.first_name?.[0]??''}${s.last_name?.[0]??''}`.toUpperCase();
                return (
                  <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${dark?'bg-slate-900 border-slate-700/60':'bg-slate-50 border-slate-200'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${dark?'bg-brand-900/50 text-brand-300':'bg-brand-100 text-brand-600'}`}>{initials}</div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${dark?'text-slate-100':'text-slate-800'}`}>{s.first_name} {s.last_name}</p>
                      <p className={`text-[10px] ${dark?'text-slate-500':'text-slate-400'}`}>{s.student_number} · {s.section}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </FModal>
  );
};

const SubjectsPanel = ({facultyId}) => {
  const dark=useTheme();
  const [schedules,setSchedules]=useState([]);
  const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState(null);

  const load=useCallback(async()=>{
    setLoading(true);setErr(null);
    try{
      const [allSch,allStu]=await Promise.all([api.schedules.getAll(),api.students.getAll()]);
      const mine=allSch.filter(s=>s.faculty_id===facultyId);
      setSchedules(mine);
      const mySec=new Set(mine.map(s=>s.section?.section_name).filter(Boolean));
      setStudents(allStu.filter(s=>s.section&&mySec.has(s.section)));
    }catch{setErr('Could not load subjects.');}
    finally{setLoading(false);}
  },[facultyId]);

  useEffect(()=>{load();},[load]);

  if(loading) return <Spinner/>;
  if(err) return <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm text-center">{err}</div>;

  const subjectMap={};
  schedules.forEach(s=>{
    if(s.subject&&!subjectMap[s.subject.id]) subjectMap[s.subject.id]={...s.subject,sections:[]};
    if(s.subject&&s.section) subjectMap[s.subject.id].sections.push(s.section.section_name);
  });
  const subjects=Object.values(subjectMap);
  const filtered=subjects.filter(s=>s.subject_code?.toLowerCase().includes(search.toLowerCase())||s.descriptive_title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      {selected&&<SubjectDetailModal subject={selected} students={students} schedules={schedules} onClose={()=>setSelected(null)}/>}
      <div className="relative">
        <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark?'text-slate-500':'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input className={`${mkInp(dark)} pl-9`} placeholder="Search subjects..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      {filtered.length===0?(
        <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
          <span className="text-5xl mb-3">📚</span>
          <p className={`text-sm font-semibold ${dark?'text-slate-300':'text-slate-600'}`}>{search?'No subjects match your search.':'No subjects assigned yet.'}</p>
        </div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(subj=>{
            const subjectSchedules=schedules.filter(s=>s.subject_id===subj.id);
            const sections=[...new Set(subjectSchedules.map(s=>s.section?.section_name).filter(Boolean))];
            const studentCount=students.filter(s=>s.section&&sections.includes(s.section)).length;
            return (
              <button key={subj.id} onClick={()=>setSelected(subj)} className={`text-left rounded-2xl border p-5 transition-all ${dark?'bg-slate-900 border-slate-700/60 hover:border-brand-500/50':'bg-white border-slate-200 hover:border-brand-300 hover:shadow-md shadow-sm'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${dark?'bg-blue-900/40 text-blue-300':'bg-blue-100 text-blue-700'}`}>{subj.subject_code}</span>
                    <h4 className={`text-sm font-semibold mt-2 ${dark?'text-slate-100':'text-slate-800'}`}>{subj.descriptive_title}</h4>
                  </div>
                  <div className={`text-center shrink-0 px-3 py-1.5 rounded-xl ${dark?'bg-slate-700/50':'bg-slate-100'}`}>
                    <p className={`text-lg font-bold ${dark?'text-white':'text-slate-800'}`}>{subj.total_units}</p>
                    <p className={`text-[10px] ${dark?'text-slate-400':'text-slate-500'}`}>units</p>
                  </div>
                </div>
                <div className={`text-xs space-y-1 ${dark?'text-slate-400':'text-slate-500'}`}>
                  <p>Lec: {subj.lec_units} · Lab: {subj.lab_units} · {studentCount} student{studentCount!==1?'s':''}</p>
                  {subj.pre_requisites&&<p>Pre-req: {subj.pre_requisites}</p>}
                  {sections.length>0&&<div className="flex flex-wrap gap-1 mt-2">{[...new Set(sections)].map(sec=><span key={sec} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-emerald-900/40 text-emerald-300':'bg-emerald-100 text-emerald-700'}`}>{sec}</span>)}</div>}
                </div>
                <p className={`text-[10px] mt-3 ${dark?'text-brand-400':'text-brand-600'}`}>Click to view details →</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ════ MY SCHEDULE PANEL ════ */
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const ScheduleModal = ({record,facultyId,onClose,onSaved}) => {
  const dark=useTheme();
  const empty={day_of_week:'Monday',start_time:'',end_time:'',room:'',subject_id:'',section_id:''};
  const [form,setForm]=useState(record?{...record,subject_id:record.subject_id??'',section_id:record.section_id??''}:empty);
  const [subjects,setSubjects]=useState([]);const [sections,setSections]=useState([]);const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  useEffect(()=>{Promise.all([api.subjects.getAll(),api.sections.getAll()]).then(([s,sec])=>{setSubjects(s);setSections(sec);}).catch(()=>{});},[]);
  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{
    setSaving(true);setErr(null);
    try{
      const payload={...form,faculty_id:facultyId};
      if(record) await api.schedules.update(record.id,payload);
      else await api.schedules.create(payload);
      onSaved();
    }catch(e){setErr(e.message);}
    finally{setSaving(false);}
  };
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title={record?'Edit Schedule':'Add Schedule'} onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{record?'Save Changes':'Add Schedule'}</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={lbl}>Day of Week</label><select className={`${inp} appearance-none`} value={form.day_of_week} onChange={set('day_of_week')}>{DAYS.map(d=><option key={d}>{d}</option>)}</select></div>
        <div><label className={lbl}>Room</label><input className={inp} value={form.room} onChange={set('room')} placeholder="e.g. Room 301"/></div>
        <div><label className={lbl}>Start Time</label><input type="time" className={inp} value={form.start_time} onChange={set('start_time')}/></div>
        <div><label className={lbl}>End Time</label><input type="time" className={inp} value={form.end_time} onChange={set('end_time')}/></div>
        <div><label className={lbl}>Subject</label><select className={`${inp} appearance-none`} value={form.subject_id} onChange={set('subject_id')}><option value="">Select subject...</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.subject_code} — {s.descriptive_title}</option>)}</select></div>
        <div><label className={lbl}>Section</label><select className={`${inp} appearance-none`} value={form.section_id} onChange={set('section_id')}><option value="">Select section...</option>{sections.map(s=><option key={s.id} value={s.id}>{s.section_name}</option>)}</select></div>
      </div>
    </FModal>
  );
};

const SchedulePanel = ({facultyId}) => {
  const dark=useTheme();
  const [schedules,setSchedules]=useState([]);
  const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);
  const [modal,setModal]=useState(null);
  const [deleting,setDeleting]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);

  const load=useCallback(async()=>{
    setLoading(true);setErr(null);
    try{
      const [allSch,allStu]=await Promise.all([api.schedules.getAll(),api.students.getAll()]);
      const mine=allSch.filter(s=>s.faculty_id===facultyId);
      setSchedules(mine);
      const mySec=new Set(mine.map(s=>s.section?.section_name).filter(Boolean));
      setStudents(allStu.filter(s=>s.section&&mySec.has(s.section)));
    }catch{setErr('Could not load schedule.');}
    finally{setLoading(false);}
  },[facultyId]);

  useEffect(()=>{load();},[load]);

  const del=async(id)=>{
    setDeleting(id);setConfirmDel(null);
    try{await api.schedules.delete(id);await load();}
    catch{alert('Failed to delete.');}
    finally{setDeleting(null);}
  };

  const byDay=DAYS.reduce((acc,d)=>{acc[d]=schedules.filter(s=>s.day_of_week===d);return acc;},{});

  if(loading) return <Spinner/>;
  if(err) return <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm text-center">{err}</div>;

  return (
    <div className="space-y-5">
      {modal&&<ScheduleModal record={modal==='add'?null:modal} facultyId={facultyId} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load();}}/>}
      {/* Confirm delete dialog */}
      {confirmDel&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className={`absolute inset-0 backdrop-blur-sm ${dark?'bg-slate-950':'bg-slate-900'}`} onClick={()=>setConfirmDel(null)}/>
          <div className={`relative w-full max-w-sm border rounded-2xl shadow-2xl p-6 ${dark?'bg-slate-900 border-slate-700/60':'bg-white border-slate-200'}`}>
            <p className={`text-sm font-semibold mb-1 ${dark?'text-slate-100':'text-slate-800'}`}>Delete Schedule?</p>
            <p className={`text-xs mb-5 ${dark?'text-slate-400':'text-slate-500'}`}>This will remove the schedule entry for <span className="font-semibold">{confirmDel.subject?.descriptive_title}</span> on {confirmDel.day_of_week}.</p>
            <div className="flex justify-end gap-3"><BtnGhost onClick={()=>setConfirmDel(null)}>Cancel</BtnGhost><button onClick={()=>del(confirmDel.id)} disabled={deleting===confirmDel.id} className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2">{deleting===confirmDel.id&&<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}Delete</button></div>
          </div>
        </div>
      )}
      <div className="flex justify-end"><AddBtn onClick={()=>setModal('add')} label="Add Schedule"/></div>
      {schedules.length===0?(
        <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
          <span className="text-5xl mb-3">📅</span>
          <p className={`text-sm font-semibold ${dark?'text-slate-300':'text-slate-600'}`}>No schedule entries yet.</p>
        </div>
      ):(
        <div className="space-y-4">
          {DAYS.map(day=>byDay[day].length===0?null:(
            <div key={day}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark?'text-slate-400':'text-slate-500'}`}>{day}</p>
              <div className="space-y-2">
                {byDay[day].map(s=>{
                  const secName=s.section?.section_name;
                  const studentCount=secName?students.filter(st=>st.section===secName).length:0;
                  return (
                    <div key={s.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${dark?'bg-slate-900 border-slate-700/60 hover:border-slate-600':'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                      <div className={`text-center shrink-0 w-20 px-2 py-1.5 rounded-xl ${dark?'bg-slate-700/50':'bg-slate-100'}`}>
                        <p className={`text-xs font-bold ${dark?'text-slate-200':'text-slate-700'}`}>{fmtTime(s.start_time)}</p>
                        <p className={`text-[10px] ${dark?'text-slate-500':'text-slate-400'}`}>{fmtTime(s.end_time)}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${dark?'text-slate-100':'text-slate-800'}`}>{s.subject?.descriptive_title??'—'}</p>
                        <p className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>{s.subject?.subject_code} · {secName??'—'} · {s.room}</p>
                        {studentCount>0&&<p className={`text-[10px] mt-0.5 ${dark?'text-emerald-400':'text-emerald-600'}`}>{studentCount} student{studentCount!==1?'s':''}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <BtnEdit onClick={()=>setModal(s)}/>
                        <BtnDanger onClick={()=>setConfirmDel(s)} loading={deleting===s.id}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </BtnDanger>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ════ MY STUDENTS PANEL ════ */

/* Violation CRUD Modal */
const ViolationModal = ({violation,student,facultyName,onClose,onSaved}) => {
  const dark=useTheme();
  const empty={violation_type:'',description:'',date_reported:new Date().toISOString().split('T')[0],reported_by:facultyName??'',severity_level:'Low',action_taken:'',status:'Pending',resolution_date:''};
  const [form,setForm]=useState(violation?{...violation,date_reported:violation.date_reported?.split('T')[0]??'',resolution_date:violation.resolution_date?.split('T')[0]??''}:empty);
  const [saving,setSaving]=useState(false);const [err,setErr]=useState(null);
  const set=(k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const save=async()=>{
    setSaving(true);setErr(null);
    try{
      if(violation) await api.students.updateViolation(student.id,violation.id,form);
      else await api.students.addViolation(student.id,form);
      onSaved();onClose();
    }catch(e){setErr(e.message);}
    finally{setSaving(false);}
  };
  const inp=mkInp(dark);const lbl=mkLbl(dark);
  return (
    <FModal title={violation?'Edit Violation':'Add Violation'} onClose={onClose} footer={<><BtnGhost onClick={onClose}>Cancel</BtnGhost><BtnPrimary loading={saving} onClick={save}>{violation?'Save Changes':'Add Violation'}</BtnPrimary></>}>
      <ErrMsg msg={err}/>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className={lbl}>Violation Type *</label><input className={inp} value={form.violation_type} onChange={set('violation_type')} placeholder="e.g. Academic Dishonesty"/></div>
        <div className="sm:col-span-2"><label className={lbl}>Description</label><textarea className={`${inp} resize-none`} rows={3} value={form.description} onChange={set('description')} placeholder="Describe the violation..."/></div>
        <div><label className={lbl}>Date Reported *</label><input type="date" className={inp} value={form.date_reported} onChange={set('date_reported')}/></div>
        <div><label className={lbl}>Reported By</label><input className={inp} value={form.reported_by} onChange={set('reported_by')}/></div>
        <div><label className={lbl}>Severity Level *</label><select className={`${inp} appearance-none`} value={form.severity_level} onChange={set('severity_level')}><option>Low</option><option>Medium</option><option>High</option></select></div>
        <div><label className={lbl}>Status *</label><select className={`${inp} appearance-none`} value={form.status} onChange={set('status')}><option>Pending</option><option>Under Review</option><option>Resolved</option></select></div>
        <div className="sm:col-span-2"><label className={lbl}>Action Taken</label><textarea className={`${inp} resize-none`} rows={2} value={form.action_taken} onChange={set('action_taken')} placeholder="Describe action taken..."/></div>
        <div><label className={lbl}>Resolution Date</label><input type="date" className={inp} value={form.resolution_date} onChange={set('resolution_date')}/></div>
      </div>
    </FModal>
  );
};

/* Full Student Detail Modal with Violations CRUD */
const StudentDetailModal = ({student:initialStudent,facultyName,onClose}) => {
  const dark=useTheme();
  const [student,setStudent]=useState(initialStudent);
  const [tab,setTab]=useState('info');
  const [violModal,setViolModal]=useState(null); // null | 'add' | violation object
  const [deleting,setDeleting]=useState(null);

  const reload=async()=>{
    try{const fresh=await api.students.get(student.id);setStudent(fresh);}catch{}
  };

  const deleteViolation=async(v)=>{
    if(!window.confirm('Delete this violation record?')) return;
    setDeleting(v.id);
    try{await api.students.deleteViolation(student.id,v.id);await reload();}
    catch{alert('Failed to delete.');}
    finally{setDeleting(null);}
  };

  const s=student;
  const fullName=[s.first_name,s.middle_name,s.last_name,s.suffix].filter(Boolean).join(' ');
  const initials=`${s.first_name?.[0]??''}${s.last_name?.[0]??''}`.toUpperCase();

  const TABS=[{id:'info',label:'Info'},{id:'violations',label:`Violations (${s.violations?.length??0})`},{id:'academic',label:'Academic'},{id:'medical',label:'Medical'}];

  const severityColor=(sev)=>{
    if(sev==='High') return dark?'bg-red-900/40 text-red-300':'bg-red-100 text-red-700';
    if(sev==='Medium') return dark?'bg-amber-900/40 text-amber-300':'bg-amber-100 text-amber-700';
    return dark?'bg-green-900/40 text-green-300':'bg-green-100 text-green-700';
  };
  const statusColor=(st)=>{
    if(st==='Resolved') return dark?'bg-emerald-900/40 text-emerald-300':'bg-emerald-100 text-emerald-700';
    if(st==='Under Review') return dark?'bg-blue-900/40 text-blue-300':'bg-blue-100 text-blue-700';
    return dark?'bg-slate-700 text-slate-300':'bg-slate-100 text-slate-600';
  };

  return (
    <FModal title="Student Details" onClose={onClose} wide>
      {violModal&&<ViolationModal violation={violModal==='add'?null:violModal} student={s} facultyName={facultyName} onClose={()=>setViolModal(null)} onSaved={reload}/>}
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0 ${dark?'bg-brand-900/50 text-brand-300':'bg-brand-100 text-brand-600'}`}>{initials}</div>
          <div>
            <h2 className={`text-lg font-bold ${dark?'text-slate-100':'text-slate-800'}`}>{fullName}</h2>
            {s.student_number&&<p className={`text-xs ${dark?'text-slate-400':'text-slate-500'}`}>Student No. {s.student_number}</p>}
            <div className="flex gap-2 mt-1 flex-wrap">
              {s.enrollment_status&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-emerald-900/40 text-emerald-300':'bg-emerald-100 text-emerald-700'}`}>{s.enrollment_status}</span>}
              {s.year_level&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-blue-900/40 text-blue-300':'bg-blue-100 text-blue-700'}`}>{s.year_level}</span>}
              {s.program&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-slate-700 text-slate-300':'bg-slate-100 text-slate-600'}`}>{s.program}</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl ${dark?'bg-slate-800':'bg-slate-100'}`}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab===t.id?dark?'bg-slate-700 text-slate-100 shadow':'bg-white text-slate-800 shadow':dark?'text-slate-400 hover:text-slate-200':'text-slate-500 hover:text-slate-700'}`}>{t.label}</button>
          ))}
        </div>

        {/* Tab: Info */}
        {tab==='info'&&(
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Personal Info" icon="👤">
              <Row label="Gender" value={val(s.gender)}/><Row label="Date of Birth" value={fmt(s.birth_date)}/><Row label="Nationality" value={val(s.nationality)}/><Row label="Civil Status" value={val(s.civil_status)}/><Row label="Religion" value={val(s.religion)}/>
            </SectionCard>
            <SectionCard title="Contact" icon="📞">
              <Row label="Email" value={val(s.email)}/><Row label="Mobile" value={val(s.contact_number)}/><Row label="Alt. Contact" value={val(s.alternate_contact_number)}/><Row label="Address" value={val([s.barangay,s.city,s.province].filter(Boolean).join(', ')||null)}/>
            </SectionCard>
            <SectionCard title="Enrollment" icon="🎓">
              <Row label="Program" value={val(s.program)}/><Row label="Year Level" value={val(s.year_level)}/><Row label="Section" value={val(s.section)}/><Row label="Student Type" value={val(s.student_type)}/><Row label="Date Enrolled" value={fmt(s.date_enrolled)}/>
            </SectionCard>
            {s.guardians?.length>0&&(
              <SectionCard title="Guardian" icon="👨‍👩‍👦">
                <Row label="Name" value={val(s.guardians[0].full_name)}/><Row label="Relationship" value={val(s.guardians[0].relationship)}/><Row label="Contact" value={val(s.guardians[0].contact_number)}/><Row label="Email" value={val(s.guardians[0].email)}/>
              </SectionCard>
            )}
          </div>
        )}

        {/* Tab: Violations */}
        {tab==='violations'&&(
          <div className="space-y-4">
            <div className="flex justify-end"><AddBtn onClick={()=>setViolModal('add')} label="Add Violation"/></div>
            {!s.violations?.length?(
              <div className={`rounded-2xl border p-10 text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
                <span className="text-4xl mb-2 block">✅</span>
                <p className={`text-sm ${dark?'text-slate-400':'text-slate-500'}`}>No violations on record.</p>
              </div>
            ):(
              <div className="space-y-3">
                {s.violations.map(v=>(
                  <div key={v.id} className={`p-4 rounded-2xl border ${dark?'bg-slate-900 border-slate-700/60':'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className={`text-sm font-semibold ${dark?'text-slate-100':'text-slate-800'}`}>{v.violation_type}</p>
                        <p className={`text-xs mt-0.5 ${dark?'text-slate-400':'text-slate-500'}`}>Reported: {fmt(v.date_reported)}{v.reported_by?` · by ${v.reported_by}`:''}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${severityColor(v.severity_level)}`}>{v.severity_level}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(v.status)}`}>{v.status}</span>
                      </div>
                    </div>
                    {v.description&&<p className={`text-xs mb-2 ${dark?'text-slate-400':'text-slate-500'}`}>{v.description}</p>}
                    {v.action_taken&&<p className={`text-xs italic ${dark?'text-slate-500':'text-slate-400'}`}>Action: {v.action_taken}</p>}
                    <div className="flex justify-end gap-1 mt-3">
                      <BtnEdit onClick={()=>setViolModal(v)} label="Edit"/>
                      <BtnDanger onClick={()=>deleteViolation(v)} loading={deleting===v.id}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>Delete
                      </BtnDanger>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Academic */}
        {tab==='academic'&&(
          <div className="space-y-3">
            <SectionCard title="Academic Background" icon="📖">
              <Row label="LRN" value={val(s.lrn)}/><Row label="Last School Attended" value={val(s.last_school_attended)}/><Row label="Last Year Attended" value={val(s.last_year_attended)}/><Row label="Honors Received" value={val(s.honors_received)}/>
            </SectionCard>
            {s.academicHistories?.length>0&&(
              <SectionCard title="Academic History" icon="📋">
                <div className="space-y-2">
                  {s.academicHistories.map((h,i)=>(
                    <div key={i} className={`p-3 rounded-xl border ${dark?'bg-slate-900 border-slate-700/60':'bg-slate-50 border-slate-200'}`}>
                      <Row label="School Year" value={val(h.school_year)}/><Row label="Year Level" value={val(h.year_level)}/><Row label="GWA" value={val(h.gwa)}/><Row label="Status" value={val(h.status)}/>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
            {s.skills?.length>0&&(
              <SectionCard title="Skills" icon="🛠️">
                <div className="flex flex-wrap gap-2">
                  {s.skills.map((sk,i)=><span key={i} className={`text-xs px-3 py-1 rounded-full font-medium ${dark?'bg-purple-900/40 text-purple-300':'bg-purple-100 text-purple-700'}`}>{sk.skill_name}</span>)}
                </div>
              </SectionCard>
            )}
          </div>
        )}

        {/* Tab: Medical */}
        {tab==='medical'&&(
          <div>
            {!s.medicalHistories?.length?(
              <div className={`rounded-2xl border p-10 text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
                <p className={`text-sm ${dark?'text-slate-400':'text-slate-500'}`}>No medical records on file.</p>
              </div>
            ):(
              <div className="space-y-3">
                {s.medicalHistories.map((m,i)=>(
                  <SectionCard key={i} title="Medical Record" icon="🏥">
                    <Row label="Blood Type" value={val(m.bloodtype)}/><Row label="Existing Conditions" value={val(m.existing_conditions)}/><Row label="Emergency Contact" value={val(m.emergency_contact_name)}/><Row label="Emergency Number" value={val(m.emergency_contact_number)}/>
                  </SectionCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </FModal>
  );
};

const StudentsPanel = ({facultyId,facultyName}) => {
  const dark=useTheme();
  const [schedules,setSchedules]=useState([]);
  const [students,setStudents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState(null);
  const [sectionFilter,setSectionFilter]=useState('');

  const load=useCallback(async()=>{
    setLoading(true);setErr(null);
    try{
      const [allSch,allStu]=await Promise.all([api.schedules.getAll(),api.students.getAll()]);
      const mine=allSch.filter(s=>s.faculty_id===facultyId);
      setSchedules(mine);
      const mySec=new Set(mine.map(s=>s.section?.section_name).filter(Boolean));
      setStudents(allStu.filter(s=>s.section&&mySec.has(s.section)));
    }catch{setErr('Could not load students.');}
    finally{setLoading(false);}
  },[facultyId]);

  useEffect(()=>{load();},[load]);

  const sections=[...new Set(schedules.map(s=>s.section?.section_name).filter(Boolean))];
  const filtered=students.filter(s=>{
    const name=`${s.first_name} ${s.last_name}`.toLowerCase();
    const matchSearch=name.includes(search.toLowerCase())||(s.student_number?.includes(search));
    const matchSection=!sectionFilter||s.section===sectionFilter;
    return matchSearch&&matchSection;
  });

  if(loading) return <Spinner/>;
  if(err) return <div className="p-4 rounded-xl bg-red-900/20 border border-red-800/40 text-red-400 text-sm text-center">{err}</div>;

  return (
    <div className="space-y-5">
      {selected&&<StudentDetailModal student={selected} facultyName={facultyName} onClose={()=>setSelected(null)}/>}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark?'text-slate-500':'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input className={`${mkInp(dark)} pl-9`} placeholder="Search by name or student number..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {sections.length>0&&<select className={`${mkInp(dark)} appearance-none w-full sm:w-48`} value={sectionFilter} onChange={e=>setSectionFilter(e.target.value)}><option value="">All Sections</option>{sections.map(sec=><option key={sec}>{sec}</option>)}</select>}
      </div>
      <p className={`text-xs ${dark?'text-slate-500':'text-slate-400'}`}>{filtered.length} student{filtered.length!==1?'s':''} found</p>
      {filtered.length===0?(
        <div className={`rounded-2xl border p-12 flex flex-col items-center justify-center text-center ${dark?'bg-slate-900/60 border-slate-700/50':'bg-white border-slate-200'}`}>
          <span className="text-5xl mb-3">👥</span>
          <p className={`text-sm font-semibold ${dark?'text-slate-300':'text-slate-600'}`}>{search||sectionFilter?'No students match your filters.':'No students found in your sections.'}</p>
        </div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s=>{
            const initials=`${s.first_name?.[0]??''}${s.last_name?.[0]??''}`.toUpperCase();
            const violCount=s.violations?.length??0;
            return (
              <button key={s.id} onClick={()=>setSelected(s)} className={`text-left p-4 rounded-2xl border transition-all ${dark?'bg-slate-900 border-slate-700/60 hover:border-brand-500/50 hover:bg-slate-800':'bg-white border-slate-200 hover:border-brand-300 hover:shadow-md shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${dark?'bg-brand-900/50 text-brand-300':'bg-brand-100 text-brand-600'}`}>{initials}</div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${dark?'text-slate-100':'text-slate-800'}`}>{s.first_name} {s.last_name}</p>
                    {s.student_number&&<p className={`text-xs ${dark?'text-slate-500':'text-slate-400'}`}>{s.student_number}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.section&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-emerald-900/40 text-emerald-300':'bg-emerald-100 text-emerald-700'}`}>{s.section}</span>}
                  {s.year_level&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-blue-900/40 text-blue-300':'bg-blue-100 text-blue-700'}`}>{s.year_level}</span>}
                  {violCount>0&&<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark?'bg-red-900/40 text-red-300':'bg-red-100 text-red-700'}`}>{violCount} violation{violCount!==1?'s':''}</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ════ MAIN COMPONENT ════ */
const FacultyDashboard = ({user,onLogout}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active,setActive]=useState(()=>searchParams.get('section')||'dashboard');

  const navigateTo = (section) => {
    setActive(section);
    setSearchParams({ section }, { replace: true });
  };
  const [sidebarPinned,setSidebarPinned]=useState(false);
  const [sidebarHovered,setSidebarHovered]=useState(false);
  const [dark,setDark]=useState(()=>localStorage.getItem('fd_theme')!=='light');
  const [faculty,setFaculty]=useState(null);
  const [loadingProfile,setLoadingProfile]=useState(false);
  const [profileErr,setProfileErr]=useState(null);
  const [subjectsCount,setSubjectsCount]=useState('—');
  const [studentsCount,setStudentsCount]=useState('—');
  const [schedulesCount,setSchedulesCount]=useState('—');

  const toggleTheme=()=>setDark(d=>{const next=!d;localStorage.setItem('fd_theme',next?'dark':'light');return next;});

  const loadFaculty=useCallback(async()=>{
    if(!user?.faculty_id) return;
    setLoadingProfile(true);setProfileErr(null);
    try{setFaculty(await api.faculties.get(user.faculty_id));}
    catch{setProfileErr('Could not load profile data.');}
    finally{setLoadingProfile(false);}
  },[user?.faculty_id]);

  useEffect(()=>{loadFaculty();},[loadFaculty]);

  useEffect(()=>{
    if(!user?.faculty_id) return;
    api.schedules.getAll().then(all=>{
      const mine=all.filter(s=>s.faculty_id===user.faculty_id);
      setSchedulesCount(mine.length);
      setSubjectsCount(new Set(mine.map(s=>s.subject_id).filter(Boolean)).size);
    }).catch(()=>{});
    Promise.all([api.students.getAll(),api.schedules.getAll()]).then(([allStu,allSch])=>{
      const mySec=new Set(allSch.filter(s=>s.faculty_id===user.faculty_id).map(s=>s.section?.section_name).filter(Boolean));
      setStudentsCount(allStu.filter(s=>s.section&&mySec.has(s.section)).length);
    }).catch(()=>{});
  },[user?.faculty_id]);

  const sidebarExpanded=sidebarPinned||sidebarHovered;
  const initials=user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()??'FC';
  const activeNav=NAV_ITEMS.find(n=>n.id===active);
  const facultyName=faculty?[faculty.first_name,faculty.last_name].filter(Boolean).join(' '):user?.name;

  const renderPanel=()=>{
    switch(active){
      case 'dashboard': return <DashboardPanel user={user} facultyName={facultyName} initials={initials} subjectsCount={subjectsCount} studentsCount={studentsCount} schedulesCount={schedulesCount}/>;
      case 'profile':   return <ProfilePanel faculty={faculty} loading={loadingProfile} err={profileErr} onReload={loadFaculty}/>;
      case 'subjects':  return <SubjectsPanel facultyId={user?.faculty_id}/>;
      case 'schedule':  return <SchedulePanel facultyId={user?.faculty_id}/>;
      case 'students':  return <StudentsPanel facultyId={user?.faculty_id} facultyName={facultyName}/>;
      default:          return null;
    }
  };

  return (
    <ThemeCtx.Provider value={dark}>
      <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${dark?'bg-slate-950 text-slate-100':'bg-slate-50 text-slate-900'}`}>
        {dark&&<><div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"/><div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"/></>}

        {/* Sidebar */}
        <aside className={`relative z-50 flex flex-col h-full border-r transition-all duration-300 ease-in-out shrink-0 ${sidebarExpanded?'w-64 shadow-2xl shadow-slate-900/50':'w-16'} ${dark?'bg-slate-900 border-slate-800':'bg-white border-slate-200 shadow-sm'}`}
          onMouseEnter={()=>setSidebarHovered(true)} onMouseLeave={()=>setSidebarHovered(false)}>
          {/* Sidebar logo */}
          <div className={`flex items-center border-b h-20 overflow-hidden shrink-0 transition-all duration-300 ${dark?'border-slate-800':'border-slate-100'} ${sidebarExpanded?'px-4 justify-between':'px-0 justify-center'}`}>
            <div className="flex items-center gap-3">
              {/* Logo with pulse glow */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-brand-500/30 blur-md animate-pulse pointer-events-none"/>
                <img src="/ccs_logo.jpg" alt="CCS"
                  className="relative w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(242,101,34,0.7)] transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_18px_rgba(242,101,34,0.9)]"
                  onError={e=>{e.target.style.display='none';}}/>
              </div>
              {sidebarExpanded&&(
                <div className="min-w-0 overflow-hidden">
                  <p className="text-sm font-extrabold truncate bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-amber-400 leading-tight">CCS Faculty</p>
                  <p className={`text-[10px] truncate font-medium ${dark?'text-slate-500':'text-slate-400'}`}>Profile Hub</p>
                </div>
              )}
            </div>
            {/* Pin/Unpin button — only visible when expanded */}
            {sidebarExpanded&&(
              <button onClick={()=>setSidebarPinned(p=>!p)} title={sidebarPinned?'Unpin Sidebar':'Pin Sidebar'}
                className={`p-1.5 rounded-lg transition-colors focus:outline-none shrink-0 ${
                  sidebarPinned
                    ? dark?'bg-slate-800 text-brand-400':'bg-brand-50 text-brand-500'
                    : dark?'text-slate-400 hover:text-white hover:bg-slate-800':'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}>
                {/* Pin = sidebar locked open, PinOff = free to collapse */}
                {sidebarPinned
                  ? <Pin className="w-5 h-5"/>
                  : <PinOff className="w-5 h-5"/>
                }
              </button>
            )}
          </div>
          <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 ${sidebarExpanded?'px-3':'px-2'}`}>
            {NAV_ITEMS.map(item=><NavLink key={item.id} item={item} active={active} sidebarExpanded={sidebarExpanded} onSelect={navigateTo}/>)}
          </nav>
          <div className={`border-t py-4 space-y-1 ${dark?'border-slate-800':'border-slate-100'} ${sidebarExpanded?'px-3':'px-2'}`}>
            <button onClick={onLogout} title={!sidebarExpanded?'Logout':''} className={`w-full flex items-center py-3 rounded-xl transition-all ${sidebarExpanded?'px-4':'px-0 justify-center'} text-red-400 hover:bg-red-500/10`}>
              <svg className={`w-5 h-5 shrink-0 ${sidebarExpanded?'mr-3':'mr-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              {sidebarExpanded&&<span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className={`flex items-center justify-between px-6 h-20 border-b shrink-0 ${dark?'bg-slate-900 border-slate-800 backdrop-blur-xl':'bg-white border-slate-200 shadow-sm'}`}>
            <div>
              <h1 className={`text-lg font-bold ${dark?'text-slate-100':'text-slate-800'}`}>{activeNav?.label??'Dashboard'}</h1>
              <p className={`text-xs ${dark?'text-slate-500':'text-slate-400'}`}>{facultyName} · CCS Faculty</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button onClick={toggleTheme} title={dark?'Switch to Light Mode':'Switch to Dark Mode'}
                className={`p-2 rounded-xl border transition-all ${dark?'bg-slate-800/60 border-slate-700/50 text-amber-400 hover:bg-slate-700':'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}>
                {dark
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>}
              </button>
              {/* Notification bell */}
              <button className={`relative p-2 rounded-xl border transition-all ${dark?'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200':'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
              </button>
            </div>
          </header>
          <div className={`flex-1 overflow-y-auto p-6 ${dark?'bg-slate-950':'bg-slate-50'}`}>
            {renderPanel()}
          </div>
        </main>
      </div>
    </ThemeCtx.Provider>
  );
};

export default FacultyDashboard;
